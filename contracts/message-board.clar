;; message-board.clar
;; Core contract for Bitchat on-chain message board
;; Security Enhanced Version - v3

;; Constants - Error Codes
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-invalid-input (err u103))
(define-constant err-max-edits-reached (err u104))
(define-constant err-already-reacted (err u105))
(define-constant err-too-soon (err u106))
(define-constant err-contract-paused (err u107))
(define-constant err-insufficient-balance (err u108))
(define-constant err-already-deleted (err u109))
(define-constant err-no-pending-transfer (err u110))
(define-constant err-not-proposed-owner (err u111))

;; Configuration
(define-constant min-message-length u1)
(define-constant max-message-length u280)
(define-constant default-expiry-blocks u144) ;; ~24 hours
(define-constant pin-24hr-blocks u144)
(define-constant pin-72hr-blocks u432)
(define-constant min-post-gap u6) ;; ~1 hour between posts (spam prevention)
(define-constant max-edit-count u10) ;; Maximum number of edits per message

;; Reaction types (1-5)
(define-constant reaction-type-like u1)
(define-constant reaction-type-fire u2)
(define-constant reaction-type-laugh u3)
(define-constant reaction-type-sad u4)
(define-constant reaction-type-dislike u5)
(define-constant max-reaction-type u5)

;; Fee structure (in microSTX)
(define-constant fee-post-message u10000)        ;; 0.00001 STX (~$0.0003)
(define-constant fee-pin-24hr u50000)            ;; 0.00005 STX (~$0.0015)
(define-constant fee-pin-72hr u100000)           ;; 0.0001 STX (~$0.003)
(define-constant fee-reaction u5000)             ;; 0.000005 STX (~$0.00015)

;; Data variables
(define-data-var message-nonce uint u0)
(define-data-var total-messages uint u0)
(define-data-var total-deleted uint u0)
(define-data-var total-edits uint u0)
(define-data-var total-replies uint u0)
(define-data-var total-fees-collected uint u0)
(define-data-var contract-owner principal tx-sender)
(define-data-var contract-paused bool false)
(define-data-var proposed-owner (optional principal) none)

;; Data maps
(define-map messages
  { message-id: uint }
  {
    author: principal,
    content: (string-utf8 280),
    timestamp: uint,
    block-height: uint,
    expires-at: uint,
    pinned: bool,
    pin-expires-at: uint,
    reaction-count: uint,
    deleted: bool,
    edited: bool,
    edit-count: uint,
    reply-to: uint,
    reply-count: uint
  }
)

(define-map user-stats
  { user: principal }
  {
    messages-posted: uint,
    total-spent: uint,
    last-post-block: uint
  }
)

(define-map reactions
  { message-id: uint, user: principal }
  { reacted: bool, reaction-type: uint }
)

(define-map typed-reaction-counts
  { message-id: uint, reaction-type: uint }
  { count: uint }
)

(define-map edit-history
  { message-id: uint, edit-index: uint }
  {
    previous-content: (string-utf8 280),
    edited-at-block: uint
  }
)

;; Private functions
(define-private (get-next-message-id)
  (let ((current-nonce (var-get message-nonce)))
    (var-set message-nonce (+ current-nonce u1))
    current-nonce
  )
)

(define-private (calculate-expiry-block (duration uint))
  (+ block-height duration)
)

(define-private (get-pin-fee (duration uint))
  (if (is-eq duration pin-24hr-blocks)
    fee-pin-24hr
    (if (is-eq duration pin-72hr-blocks)
      fee-pin-72hr
      u0
    )
  )
)

;; Public functions
(define-public (post-message (content (string-utf8 280)))
  (let
    (
      (message-id (get-next-message-id))
      (content-length (len content))
      (sender tx-sender)
      (expiry-block (calculate-expiry-block default-expiry-blocks))
      (current-stats (default-to 
        { messages-posted: u0, total-spent: u0, last-post-block: u0 }
        (map-get? user-stats { user: sender })
      ))
      (last-post (get last-post-block current-stats))
    )
    ;; Security: Check if contract is paused
    (asserts! (not (var-get contract-paused)) err-contract-paused)
    
    ;; Validate message length
    (asserts! (>= content-length min-message-length) err-invalid-input)
    (asserts! (<= content-length max-message-length) err-invalid-input)
    
    ;; Spam prevention: Enforce minimum gap between posts
    (asserts! (or (is-eq last-post u0) 
                  (>= (- block-height last-post) min-post-gap)) 
      err-too-soon)
    
    ;; Collect posting fee - SECURITY FIX: Proper fee collection
    (try! (stx-transfer? fee-post-message sender (as-contract tx-sender)))
    
    ;; Update fee counter
    (var-set total-fees-collected (+ (var-get total-fees-collected) fee-post-message))
    
    ;; Store message
    (map-set messages
      { message-id: message-id }
      {
        author: sender,
        content: content,
        timestamp: burn-block-height,
        block-height: block-height,
        expires-at: expiry-block,
        pinned: false,
        pin-expires-at: u0,
        reaction-count: u0,
        deleted: false,
        edited: false,
        edit-count: u0,
        reply-to: u0,
        reply-count: u0
      }
    )
    
    ;; Increment total messages counter
    (var-set total-messages (+ (var-get total-messages) u1))
    
    ;; Update user stats
    (map-set user-stats
      { user: sender }
      {
        messages-posted: (+ (get messages-posted current-stats) u1),
        total-spent: (+ (get total-spent current-stats) fee-post-message),
        last-post-block: block-height
      }
    )
    
    ;; Event logging
    (print {
      event: "message-posted",
      message-id: message-id,
      author: sender,
      block: block-height
    })
    
    (ok message-id)
  )
)

;; Read-only functions
(define-read-only (get-message (message-id uint))
  (map-get? messages { message-id: message-id })
)

(define-read-only (get-user-stats (user principal))
  (map-get? user-stats { user: user })
)

(define-read-only (get-total-messages)
  (ok (var-get total-messages))
)

(define-read-only (get-total-deleted)
  (ok (var-get total-deleted))
)

(define-read-only (get-total-edits)
  (ok (var-get total-edits))
)

(define-read-only (get-total-replies)
  (ok (var-get total-replies))
)

(define-read-only (get-reply-parent (message-id uint))
  (let
    (
      (message (unwrap! (map-get? messages { message-id: message-id }) err-not-found))
      (reply-to-val (get reply-to message))
    )
    (if (> reply-to-val u0)
      (ok (- reply-to-val u1))
      (ok u0)
    )
  )
)

(define-read-only (is-reply (message-id uint))
  (let
    (
      (message (unwrap! (map-get? messages { message-id: message-id }) err-not-found))
    )
    (ok (> (get reply-to message) u0))
  )
)

(define-read-only (get-edit-history (message-id uint) (edit-index uint))
  (map-get? edit-history { message-id: message-id, edit-index: edit-index })
)

(define-read-only (get-total-fees-collected)
  (ok (var-get total-fees-collected))
)

(define-read-only (get-message-nonce)
  (ok (var-get message-nonce))
)

(define-read-only (has-user-reacted (message-id uint) (user principal))
  (default-to false (get reacted (map-get? reactions { message-id: message-id, user: user })))
)

(define-read-only (get-user-reaction-type (message-id uint) (user principal))
  (get reaction-type (map-get? reactions { message-id: message-id, user: user }))
)

(define-read-only (get-reaction-count-by-type (message-id uint) (reaction-type uint))
  (default-to u0 (get count (map-get? typed-reaction-counts { message-id: message-id, reaction-type: reaction-type })))
)
(define-read-only (is-contract-paused)
  (var-get contract-paused)
)

(define-read-only (get-contract-owner)
  (ok (var-get contract-owner))
)

(define-read-only (is-message-pinned (message-id uint))
  (match (map-get? messages { message-id: message-id })
    message (and 
      (get pinned message)
      (> (get pin-expires-at message) block-height)
    )
    false
  )
)

(define-read-only (is-message-deleted (message-id uint))
  (match (map-get? messages { message-id: message-id })
    message (get deleted message)
    false
  )
)

(define-public (pin-message (message-id uint) (duration uint))
  (let
    (
      (message (unwrap! (map-get? messages { message-id: message-id }) err-not-found))
      (sender tx-sender)
      (message-author (get author message))
      (pin-fee (get-pin-fee duration))
      (pin-expiry (calculate-expiry-block duration))
      (current-stats (default-to 
        { messages-posted: u0, total-spent: u0, last-post-block: u0 }
        (map-get? user-stats { user: sender })
      ))
    )
    ;; Security: Check if contract is paused
    (asserts! (not (var-get contract-paused)) err-contract-paused)
    
    ;; Cannot pin a deleted message
    (asserts! (not (get deleted message)) err-already-deleted)
    
    ;; Validate message exists and sender is author
    (asserts! (is-eq sender message-author) err-unauthorized)
    
    ;; Validate duration is supported
    (asserts! (or (is-eq duration pin-24hr-blocks) (is-eq duration pin-72hr-blocks)) err-invalid-input)
    
    ;; Collect pin fee - SECURITY FIX: Proper fee collection
    (try! (stx-transfer? pin-fee sender (as-contract tx-sender)))
    
    ;; Update fee counter
    (var-set total-fees-collected (+ (var-get total-fees-collected) pin-fee))
    
    ;; Update message with pin status
    (map-set messages
      { message-id: message-id }
      (merge message {
        pinned: true,
        pin-expires-at: pin-expiry
      })
    )
    
    ;; Update user stats with pin spending
    ;; Note: preserve last-post-block to avoid resetting the post cooldown timer
    (map-set user-stats
      { user: sender }
      {
        messages-posted: (get messages-posted current-stats),
        total-spent: (+ (get total-spent current-stats) pin-fee),
        last-post-block: (get last-post-block current-stats)
      }
    )
    
    ;; Event logging
    (print {
      event: "message-pinned",
      message-id: message-id,
      author: sender,
      duration: duration,
      expires: pin-expiry
    })
    
    (ok true)
  )
)

(define-public (react-to-message (message-id uint))
  (let
    (
      (message (unwrap! (map-get? messages { message-id: message-id }) err-not-found))
      (sender tx-sender)
      (already-reacted (default-to false (get reacted (map-get? reactions { message-id: message-id, user: sender }))))
      (current-reaction-count (get reaction-count message))
      (current-stats (default-to 
        { messages-posted: u0, total-spent: u0, last-post-block: u0 }
        (map-get? user-stats { user: sender })
      ))
      (current-type-count (default-to { count: u0 } (map-get? typed-reaction-counts { message-id: message-id, reaction-type: reaction-type-like })))
    )
    ;; Security: Check if contract is paused
    (asserts! (not (var-get contract-paused)) err-contract-paused)
    
    ;; Cannot react to a deleted message
    (asserts! (not (get deleted message)) err-already-deleted)
    
    ;; Prevent duplicate reactions
    (asserts! (not already-reacted) err-already-reacted)
    
    ;; Collect reaction fee - SECURITY FIX: Proper fee collection
    (try! (stx-transfer? fee-reaction sender (as-contract tx-sender)))
    
    ;; Update fee counter
    (var-set total-fees-collected (+ (var-get total-fees-collected) fee-reaction))
    
    ;; Store reaction (defaults to 'like' type for backward compatibility)
    (map-set reactions
      { message-id: message-id, user: sender }
      { reacted: true, reaction-type: reaction-type-like }
    )

    ;; Update typed reaction count
    (map-set typed-reaction-counts
      { message-id: message-id, reaction-type: reaction-type-like }
      { count: (+ (get count current-type-count) u1) }
    )
    
    ;; Increment reaction count on message
    (map-set messages
      { message-id: message-id }
      (merge message {
        reaction-count: (+ current-reaction-count u1)
      })
    )
    
    ;; Update user stats with reaction spending
    ;; Note: preserve last-post-block to avoid resetting the post cooldown timer
    (map-set user-stats
      { user: sender }
      {
        messages-posted: (get messages-posted current-stats),
        total-spent: (+ (get total-spent current-stats) fee-reaction),
        last-post-block: (get last-post-block current-stats)
      }
    )
    
    ;; Event logging
    (print {
      event: "reaction-added",
      message-id: message-id,
      user: sender,
      reaction-type: reaction-type-like
    })
    
    (ok true)
  )
)

;; Typed reaction - allows specifying reaction type (1-5)
(define-public (react-to-message-typed (message-id uint) (rtype uint))
  (let
    (
      (message (unwrap! (map-get? messages { message-id: message-id }) err-not-found))
      (sender tx-sender)
      (already-reacted (default-to false (get reacted (map-get? reactions { message-id: message-id, user: sender }))))
      (current-reaction-count (get reaction-count message))
      (current-stats (default-to 
        { messages-posted: u0, total-spent: u0, last-post-block: u0 }
        (map-get? user-stats { user: sender })
      ))
      (current-type-count (default-to { count: u0 } (map-get? typed-reaction-counts { message-id: message-id, reaction-type: rtype })))
    )
    ;; Check if contract is paused
    (asserts! (not (var-get contract-paused)) err-contract-paused)

    ;; Cannot react to a deleted message
    (asserts! (not (get deleted message)) err-already-deleted)

    ;; Validate reaction type is in range [1, max-reaction-type]
    (asserts! (>= rtype u1) err-invalid-input)
    (asserts! (<= rtype max-reaction-type) err-invalid-input)

    ;; Prevent duplicate reactions
    (asserts! (not already-reacted) err-already-reacted)

    ;; Collect reaction fee
    (try! (stx-transfer? fee-reaction sender (as-contract tx-sender)))

    ;; Update fee counter
    (var-set total-fees-collected (+ (var-get total-fees-collected) fee-reaction))

    ;; Store reaction with type
    (map-set reactions
      { message-id: message-id, user: sender }
      { reacted: true, reaction-type: rtype }
    )

    ;; Update typed reaction count
    (map-set typed-reaction-counts
      { message-id: message-id, reaction-type: rtype }
      { count: (+ (get count current-type-count) u1) }
    )

    ;; Increment total reaction count on message
    (map-set messages
      { message-id: message-id }
      (merge message {
        reaction-count: (+ current-reaction-count u1)
      })
    )

    ;; Update user stats
    (map-set user-stats
      { user: sender }
      {
        messages-posted: (get messages-posted current-stats),
        total-spent: (+ (get total-spent current-stats) fee-reaction),
        last-post-block: (get last-post-block current-stats)
      }
    )

    ;; Event logging
    (print {
      event: "reaction-added",
      message-id: message-id,
      user: sender,
      reaction-type: rtype
    })

    (ok true)
  )
)

;; Message deletion - author only
(define-public (delete-message (message-id uint))
  (let
    (
      (message (unwrap! (map-get? messages { message-id: message-id }) err-not-found))
      (sender tx-sender)
      (message-author (get author message))
      (is-deleted (get deleted message))
    )
    ;; Check if contract is paused
    (asserts! (not (var-get contract-paused)) err-contract-paused)

    ;; Only the original author can delete their message
    (asserts! (is-eq sender message-author) err-unauthorized)

    ;; Cannot delete an already-deleted message
    (asserts! (not is-deleted) err-already-deleted)

    ;; Soft delete: mark the message as deleted but keep the record
    (map-set messages
      { message-id: message-id }
      (merge message {
        deleted: true,
        pinned: false,
        pin-expires-at: u0
      })
    )

    ;; Increment deletion counter
    (var-set total-deleted (+ (var-get total-deleted) u1))

    ;; Event logging
    (print {
      event: "message-deleted",
      message-id: message-id,
      author: sender,
      block: block-height
    })

    (ok true)
  )
)

;; Message editing - author only, with history tracking
(define-public (edit-message (message-id uint) (new-content (string-utf8 280)))
  (let
    (
      (message (unwrap! (map-get? messages { message-id: message-id }) err-not-found))
      (sender tx-sender)
      (message-author (get author message))
      (current-content (get content message))
      (current-edit-count (get edit-count message))
      (content-length (len new-content))
    )
    ;; Check if contract is paused
    (asserts! (not (var-get contract-paused)) err-contract-paused)

    ;; Only the original author can edit their message
    (asserts! (is-eq sender message-author) err-unauthorized)

    ;; Cannot edit a deleted message
    (asserts! (not (get deleted message)) err-already-deleted)

    ;; Validate new content length
    (asserts! (>= content-length min-message-length) err-invalid-input)
    (asserts! (<= content-length max-message-length) err-invalid-input)

    ;; Enforce maximum edit count
    (asserts! (< current-edit-count max-edit-count) err-max-edits-reached)

    ;; Store the previous content in edit history
    (map-set edit-history
      { message-id: message-id, edit-index: current-edit-count }
      {
        previous-content: current-content,
        edited-at-block: block-height
      }
    )

    ;; Update the message with new content
    (map-set messages
      { message-id: message-id }
      (merge message {
        content: new-content,
        edited: true,
        edit-count: (+ current-edit-count u1)
      })
    )

    ;; Increment global edit counter
    (var-set total-edits (+ (var-get total-edits) u1))

    ;; Event logging
    (print {
      event: "message-edited",
      message-id: message-id,
      author: sender,
      edit-number: (+ current-edit-count u1),
      block: block-height
    })

    (ok true)
  )
)

;; Reply to an existing message (creates a new message linked to the parent)
(define-public (reply-to-message (parent-id uint) (content (string-utf8 280)))
  (let
    (
      (parent-message (unwrap! (map-get? messages { message-id: parent-id }) err-not-found))
      (message-id (get-next-message-id))
      (content-length (len content))
      (sender tx-sender)
      (expiry-block (calculate-expiry-block default-expiry-blocks))
      (current-stats (default-to 
        { messages-posted: u0, total-spent: u0, last-post-block: u0 }
        (map-get? user-stats { user: sender })
      ))
      (last-post (get last-post-block current-stats))
      (parent-reply-count (get reply-count parent-message))
    )
    ;; Check if contract is paused
    (asserts! (not (var-get contract-paused)) err-contract-paused)

    ;; Cannot reply to a deleted message
    (asserts! (not (get deleted parent-message)) err-already-deleted)

    ;; Validate content length
    (asserts! (>= content-length min-message-length) err-invalid-input)
    (asserts! (<= content-length max-message-length) err-invalid-input)

    ;; Spam prevention
    (asserts! (or (is-eq last-post u0) 
                  (>= (- block-height last-post) min-post-gap)) 
      err-too-soon)

    ;; Collect posting fee (same as regular post)
    (try! (stx-transfer? fee-post-message sender (as-contract tx-sender)))

    ;; Update fee counter
    (var-set total-fees-collected (+ (var-get total-fees-collected) fee-post-message))

    ;; Store the reply as a new message with reply-to set
    (map-set messages
      { message-id: message-id }
      {
        author: sender,
        content: content,
        timestamp: burn-block-height,
        block-height: block-height,
        expires-at: expiry-block,
        pinned: false,
        pin-expires-at: u0,
        reaction-count: u0,
        deleted: false,
        edited: false,
        edit-count: u0,
        reply-to: (+ parent-id u1),
        reply-count: u0
      }
    )

    ;; Increment parent's reply count
    (map-set messages
      { message-id: parent-id }
      (merge parent-message {
        reply-count: (+ parent-reply-count u1)
      })
    )

    ;; Increment counters
    (var-set total-messages (+ (var-get total-messages) u1))
    (var-set total-replies (+ (var-get total-replies) u1))

    ;; Update user stats
    (map-set user-stats
      { user: sender }
      {
        messages-posted: (+ (get messages-posted current-stats) u1),
        total-spent: (+ (get total-spent current-stats) fee-post-message),
        last-post-block: block-height
      }
    )

    ;; Event logging
    (print {
      event: "message-replied",
      message-id: message-id,
      parent-id: parent-id,
      author: sender,
      block: block-height
    })

    (ok message-id)
  )
)

;; Administrative functions

(define-public (withdraw-fees (amount uint) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) err-owner-only)
    (asserts! (> amount u0) err-invalid-input)
    (asserts! (<= amount (stx-get-balance (as-contract tx-sender))) err-insufficient-balance)
    (try! (as-contract (stx-transfer? amount tx-sender recipient)))
    (print {
      event: "fees-withdrawn",
      amount: amount,
      recipient: recipient,
      by: tx-sender,
      block: block-height
    })
    (ok true)
  )
)

(define-public (pause-contract)
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) err-owner-only)
    (var-set contract-paused true)
    (print { event: "contract-paused", by: tx-sender })
    (ok true)
  )
)

(define-public (unpause-contract)
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) err-owner-only)
    (var-set contract-paused false)
    (print { event: "contract-unpaused", by: tx-sender })
    (ok true)
  )
)

;; REMOVED: Single-step transfer-ownership is unsafe for mainnet.
;; Use the two-step pattern: propose-ownership-transfer -> accept-ownership

;; Two-step ownership transfer pattern

(define-public (propose-ownership-transfer (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) err-owner-only)
    (var-set proposed-owner (some new-owner))
    (print {
      event: "ownership-transfer-proposed",
      from: tx-sender,
      proposed-owner: new-owner,
      block: block-height
    })
    (ok true)
  )
)

(define-public (accept-ownership)
  (let
    (
      (pending (unwrap! (var-get proposed-owner) err-no-pending-transfer))
    )
    (asserts! (is-eq tx-sender pending) err-not-proposed-owner)
    (let
      (
        (previous-owner (var-get contract-owner))
      )
      (var-set contract-owner tx-sender)
      (var-set proposed-owner none)
      (print {
        event: "ownership-accepted",
        from: previous-owner,
        new-owner: tx-sender,
        block: block-height
      })
      (ok true)
    )
  )
)

(define-public (cancel-ownership-transfer)
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) err-owner-only)
    (asserts! (is-some (var-get proposed-owner)) err-no-pending-transfer)
    (var-set proposed-owner none)
    (print {
      event: "ownership-transfer-cancelled",
      by: tx-sender,
      block: block-height
    })
    (ok true)
  )
)

(define-read-only (get-proposed-owner)
  (ok (var-get proposed-owner))
)
