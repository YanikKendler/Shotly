package me.kendler.yanik.model;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import me.kendler.yanik.dto.user.UserDTO;
import me.kendler.yanik.dto.user.UserMinimalDTO;
import me.kendler.yanik.model.template.Template;
import org.hibernate.annotations.BatchSize;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "app_user")
public class User extends PanacheEntityBase {
    @Id
    @GeneratedValue
    public UUID id;
    @Column(unique = true)
    public String auth0Sub;
    public String name;
    public String email;
    @OneToMany(mappedBy = "owner", fetch = FetchType.LAZY)
    @BatchSize(size = 5)
    public Set<Shotlist> shotlists = new HashSet<>();
    @OneToMany(mappedBy = "owner", fetch = FetchType.LAZY)
    @BatchSize(size = 5)
    public Set<Template> templates = new HashSet<>();
    public ZonedDateTime createdAt;
    @Enumerated(EnumType.STRING)
    public UserTier tier = UserTier.BASIC;
    public String stripeCustomerId;
    public boolean hasCancelled = false;
    public boolean isActive = true;
    public LocalDate revokeProAfter;
    public String howDidYouHearReason;
    public Boolean allowAnalytics = null;
    //for blocking and retrying actions if user version is outdated
    @Version
    public Long version;

    public User() {
        this.createdAt = ZonedDateTime.now(ZoneOffset.UTC);
    }

    public User(String auth0Sub, String name, String email) {
        this();
        this.auth0Sub = auth0Sub;
        this.name = name;
        this.email = email;
    }

    public boolean equals(User user) {
        return this.id.equals(user.id);
    }

    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", auth0Sub='" + auth0Sub + '\'' +
                ", name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }

    public UserDTO toDTO() {
        return new UserDTO(
                id,
                auth0Sub,
                name,
                email,
                shotlists,
                templates,
                shotlists.size(),
                templates.size(),
                createdAt,
                tier,
                stripeCustomerId,
                hasCancelled,
                revokeProAfter,
                howDidYouHearReason,
                allowAnalytics
        );
    }

    public UserMinimalDTO toMinimalDTO() {
        return new UserMinimalDTO(
                id,
                email,
                auth0Sub,
                name,
                tier,
                createdAt
        );
    }
}