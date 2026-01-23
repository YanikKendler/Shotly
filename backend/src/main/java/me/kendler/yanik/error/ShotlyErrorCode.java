package me.kendler.yanik.error;

public enum ShotlyErrorCode {
    READ_NOT_ALLOWED,
    WRITE_NOT_ALLOWED,
    NOT_ALLOWED, //generic error for actions that are forbidden because the state is wrong

    SHOTLIST_LIMIT_REACHED, //user can not create or edit shotlists because he is at his limit
    COLLABORATOR_LIMIT_REACHED, //a shotlist can not have more then 5 collaborators for basic users

    NOT_FOUND,

    ACCOUNT_DEACTIVATED,
    NO_STRIPE_CUSTOMER_ID,
    ALREADY_SUBSCRIBED,
    CHECKOUT_FAILED,

    INVALID_INPUT, // generic error for invalid input data
    IMPOSSIBLE_INPUT // input that should never be possible and suggest a bug or designed misuse
}