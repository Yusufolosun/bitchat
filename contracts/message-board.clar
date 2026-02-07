;; message-board.clar
;; Core contract for Bitchat on-chain message board

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-invalid-input (err u103))
(define-constant err-message-expired (err u104))

;; Configuration
(define-constant min-message-length u1)
(define-constant max-message-length u280)
(define-constant default-expiry-blocks u144) ;; ~24 hours
(define-constant pin-24hr-blocks u144)
(define-constant pin-72hr-blocks u432)

;; Fee structure (in microSTX)
(define-constant fee-post-message u10000)        ;; 0.00001 STX (~$0.0003)
(define-constant fee-pin-24hr u50000)            ;; 0.00005 STX (~$0.0015)
(define-constant fee-pin-72hr u100000)           ;; 0.0001 STX (~$0.003)
(define-constant fee-reaction u5000)             ;; 0.000005 STX (~$0.00015)

;; Data variables
(define-data-var message-nonce uint u0)
(define-data-var total-messages uint u0)
(define-data-var total-fees-collected uint u0)

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
    reaction-count: uint
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
  { reacted: bool }
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
    )
    ;; Validate message length
    (asserts! (>= content-length min-message-length) err-invalid-input)
    (asserts! (<= content-length max-message-length) err-invalid-input)
    
    ;; Transfer posting fee to contract
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
        reaction-count: u0
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
