CREATE TABLE app_user_blocked_user (
    user_id UUID NOT NULL,
    blocked_user_id UUID NOT NULL,
    PRIMARY KEY (user_id, blocked_user_id),
    CONSTRAINT fk_app_user_blocked_user_user
        FOREIGN KEY (user_id) REFERENCES app_user(id),
    CONSTRAINT fk_app_user_blocked_user_blocked
        FOREIGN KEY (blocked_user_id) REFERENCES app_user(id)
);