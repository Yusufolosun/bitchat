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
