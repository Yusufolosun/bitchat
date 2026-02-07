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
