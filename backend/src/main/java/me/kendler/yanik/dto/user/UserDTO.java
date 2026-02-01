package me.kendler.yanik.dto.user;

import jakarta.persistence.*;
import me.kendler.yanik.model.Shotlist;
import me.kendler.yanik.model.UserTier;
import me.kendler.yanik.model.template.Template;
import org.hibernate.annotations.BatchSize;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

public record UserDTO (
        UUID id,
        String auth0Sub,
        String name,
        String email,
        Set<Shotlist> shotlists,
        Set<Template> templates,
        Integer shotlistCount,
        Integer templateCount,
        ZonedDateTime createdAt,
        UserTier tier,
        String stripeCustomerId,
        Boolean hasCancelled,
        LocalDate revokeProAfter,
        String howDidYouHearReason,
        Boolean allowAnalytics
) { }
