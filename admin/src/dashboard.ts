import {css, html, LitElement} from 'lit'
import {customElement, state} from 'lit/decorators.js'
import authService from './AuthService'
import {gqlClient, MutationResult, QueryResult} from './GqlClient'
import {
  Maybe,
  ShotlistDto,
  TemplateDto,
  StatCounts,
  UserDto,
  UserTier,
} from './generatedTypes';
import {wuTime} from '@yanikkendler/web-utils'
import {Notyf} from 'notyf'

export enum SortName {
    Name = 'name',
    CreatedAt = 'createdAt',
    CreatedAtReverse = 'createdAtReverse',
    ActiveAt = 'activeAt',
    Tier = 'tier'
}

@customElement('app-dashboard')
export class Dashboard extends LitElement {
    static override styles = css`
        :host {
            font-family: system-ui, sans-serif;
            color: hsl(0, 0%, 90%);
            overflow-x: hidden;
            display: flex;
            flex-direction: column;
            padding: 0.5rem;
            padding-bottom: 5rem;
            padding-top: 3rem;
        }

        * {
            padding: 0;
            margin: 0;
            box-sizing: border-box;
        }

        h1 {
            @media screen and (max-width: 600px) {
                display: none;
            }
        }

        button {
            background-color: hsl(0, 0%, 20%);
            border: none;
            padding: 0.5rem;
            height: fit-content;
            color: white;
            font-weight: bold;
            cursor: pointer;
            font-size: inherit;

            &:hover {
                background-color: hsl(0, 0%, 30%);
            }

            &[disabled] {
                opacity: 0.5;
                pointer-events: none;
            }
        }

        select, input {
            background-color: hsl(0, 0%, 20%);
            color: white;
            border: none;
            outline: none;
            padding: 0.3rem;
        }

        nav {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background-color: hsl(0, 0%, 10%);
            padding: .5rem;
            z-index: 100;

            img {
                height: 2rem;
            }
            
            .right {
                display: flex;
                gap: 0.5rem;
                margin-left: auto;
                
                @media screen and (max-width: 600px) {
                    font-size: .8rem;
                }
            }
        }

        .heading {
            display: flex;
            align-items: flex-end;
            margin-top: 1rem;
            gap: 0.2rem;

            p {
                color: hsl(0, 0%, 70%);
                margin-bottom: 0.2rem;
            }

            button {
                background-color: transparent;
                text-decoration: underline;
                padding: 0.2rem;
                font-size: 1rem;
                font-weight: bold;
                margin-left: 0.3rem;

                &:hover {
                    color: hsl(18, 100%, 70%);
                }
            }
        }

        .scrollArea {
            margin-top: 1rem;
            width: 100%;
            max-height: 50vh;
            overflow: auto;
            -ms-overflow-style: none; /* IE and Edge */
            scrollbar-width: none; /* Firefox */

            &::-webkit-scrollbar {
                display: none; /*Chrome, Safari and Opera */
            }
        }

        .empty {
            padding: 0.3rem;
            color: gray;
            font-style: italic;
            white-space: nowrap;
        }
        
        table.users {
            th {
                width: 8ch;
            }
        }

        table {
            font-size: 0.9rem;

            @media screen and (max-width: 600px) {
                font-size: 0.8rem;
            }
        }

        tr {
            width: 100%;
            --row-bg: hsl(0, 0%, 10%);
            
            &.sticky th {
                position: sticky;
                top: 0;
                z-index: 20 !important;
                
                &.name {
                    z-index: 30 !important;
                }
            }

            td.name {
                --row-bg: hsl(19, 60%, 10%);
            }

            &:nth-child(odd) td {
                --row-bg: hsl(0, 0%, 20%);

                &.name {
                    --row-bg: hsl(19, 50%, 18%);
                }
            }

            &:hover td.name {
                color: hsl(18, 100%, 70%);
                background-color: hsl(19, 90%, 15%);
            }

            th {
                padding: 0.3rem;
                background-color: hsl(0, 0%, 30%);
                width: fit-content;

                &.name {
                    background-color: hsl(19, 50%, 30%);
                }
            }

            td {
                background-color: var(--row-bg);

                &.edited {
                    outline: 2px solid hsl(18, 90%, 58%);
                }
            }

            td,
            th {
                white-space: nowrap;
                outline: 1px solid hsl(0, 0%, 0%);

                &.name {
                    position: sticky;
                    left: 0;
                    z-index: 1;
                    font-weight: 500;

                    .cellValue {
                        max-width: 15ch;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        padding-inline: .2rem;
                    }
                }

                &.truncate {
                    .cellValue {
                        max-width: 10ch;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }
                }

                &.empty {
                    color: gray;
                }

                &.copy {
                    cursor: pointer;

                    &:hover {
                        --row-bg: hsl(0, 0%, 30%);
                    }
                }

                &.clickable {
                    &:hover {
                        --row-bg: hsl(0, 0%, 30%);
                    }
                }

                &.selectable {
                    cursor: pointer;
                    &:hover {
                        outline: 1.5px solid white;
                        color: white;
                        text-decoration: underline;
                    }
                }

                &:has(button.revokePro) {
                    padding-inline: 0.3rem;
                }

                p.cellValue {
                    padding: 0.3rem;
                    max-width: 30ch;
                    white-space: wrap;
                    width: max-content;
                }

                p.centered {
                    text-align: center;
                    padding: 0.3rem;
                }

                select,
                input {
                    padding: 0.3rem;
                    background-color: var(--row-bg);
                    color: hsl(0, 0%, 90%);
                    outline: none;
                    border: none;
                }

                select {
                    cursor: pointer;
                }

                input {
                    width: 100%;

                    &::-webkit-calendar-picker-indicator {
                        filter: invert(100%);
                        cursor: pointer;
                    }
                }

                button.revokePro {
                    font-size: 0.8rem;
                    margin-left: 0.3rem;
                    text-decoration: underline;
                    background-color: transparent;
                    padding: 0.3rem;

                    &:hover {
                        background-color: #b33636;
                    }
                }
            }
        }
    `

    @state()
    users: UserDto[] | null = null

    @state()
    shotlists: ShotlistDto[] | null = null

    @state()
    templates: TemplateDto[] | null = null

    @state()
    recentActiveUsers: StatCounts | null = null

    @state()
    recentCreatedUsers: StatCounts | null = null

    @state()
    recentCreatedShotlists: StatCounts | null = null

    @state()
    changes: UserDto[] = []

    @state()
    discard = false

    @state()
    userFilter: UserDto | null = null

    @state()
    selectedUserSort: SortName = SortName.Name

    @state()
    userSearchQuery: string = ""

    sorts = new Map<SortName, (u1: UserDto, u2: UserDto) => number>([
        [SortName.Name, (u1, u2) => u1.name?.localeCompare(u2.name || '') || 0],
        [
            SortName.CreatedAt,
            (u1, u2) => {
                const time1 = u1.createdAt
                    ? new Date(u1.createdAt).getTime()
                    : Number.MAX_SAFE_INTEGER
                const time2 = u2.createdAt
                    ? new Date(u2.createdAt).getTime()
                    : Number.MAX_SAFE_INTEGER

                return time1 - time2
            },
        ],
        [
            SortName.CreatedAtReverse,
            (u1, u2) => {
                const time1 = u1.createdAt
                    ? new Date(u1.createdAt).getTime()
                    : Number.MAX_SAFE_INTEGER
                const time2 = u2.createdAt
                    ? new Date(u2.createdAt).getTime()
                    : Number.MAX_SAFE_INTEGER

                return time2 - time1
            },
        ],
        [
            SortName.ActiveAt,
            (u1, u2) => {
                const time1 = u1.lastActiveAt
                    ? new Date(u1.lastActiveAt).getTime()
                    : Number.MAX_SAFE_INTEGER
                const time2 = u2.lastActiveAt
                    ? new Date(u2.lastActiveAt).getTime()
                    : Number.MAX_SAFE_INTEGER

                return time2 - time1
            },
        ],
        [SortName.Tier, (u1, u2) => u1.tier?.localeCompare(u2.tier || '') || 0],
    ])

    override connectedCallback() {
        super.connectedCallback()

        this.getData()
    }

    async getData() {
        const client = await gqlClient.get()

        const result: QueryResult = await new Promise((resolve, reject) => {
            let result: QueryResult
            client.subscribe(
                {
                    query: `{ 
                        users{
                            id
                            name
                            auth0Sub
                            createdAt
                            lastActiveAt
                            active
                            email
                            hasCancelled
                            howDidYouHearReason
                            revokeProAfter
                            shotlistCount
                            stripeCustomerId
                            templateCount
                            tier
                        }
                        allShotlists {
                            id
                            name
                            createdAt
                            editedAt
                            sceneCount
                            shotCount
                            sceneAttributeDefinitionCount
                            shotAttributeDefinitionCount
                            collaboratorCount
                            template {
                                id
                                name
                            }
                            owner{
                                id
                                name
                            }
                        }
                        allTemplates {
                            id
                            name
                            createdAt
                            editedAt
                            sceneAttributeCount
                            shotAttributeCount
                            owner{
                                id
                                name
                            }
                        }
                        recentActiveUserStats{
                            lastHour
                            fourHours
                            eightHours
                            twentyFourHours
                            sevenDays
                            thirtyDays
                        }
                        recentCreatedUserStats{
                            lastHour
                            fourHours
                            eightHours
                            twentyFourHours
                            sevenDays
                            thirtyDays
                        }
                        recentCreatedShotlistStats{
                            lastHour
                            fourHours
                            eightHours
                            twentyFourHours
                            sevenDays
                            thirtyDays
                        }
                    }`,
                },
                {
                    next: (data) => (result = data as QueryResult),
                    error: reject,
                    complete: () => resolve(result),
                }
            )
        })

        console.log(result)

        this.users = (result.data.users as UserDto[]) || []
        this.shotlists = (result.data.allShotlists as ShotlistDto[]) || []
        this.templates = (result.data.allTemplates as TemplateDto[]) || []
        this.recentActiveUsers = (result.data.recentActiveUserStats as StatCounts) || {}
        this.recentCreatedUsers = (result.data.recentCreatedUserStats as StatCounts) || {}
        this.recentCreatedShotlists =(result.data.recentCreatedShotlistStats as StatCounts) || {}

        const notyf = new Notyf()
        if (result.errors)
            notyf.error(
                `Failed to load data - ${result.errors[0].extensions.code}`
            )
    }

    storeChange(user: UserDto, target: HTMLElement) {
        const existingIndex = this.changes.findIndex((u) => u.id === user.id)

        if (existingIndex >= 0) {
            const updated = [...this.changes]
            updated[existingIndex] = {...updated[existingIndex], ...user}
            this.changes = updated
        } else {
            this.changes = [...this.changes, user]
        }

        const cell = target.closest('td')
        if (cell) cell.classList.add('edited')
    }

    renderUser(user: UserDto) {
        if (!user) {
            return html`<p>No user data</p>`
        }
        return html`
            <tr>
                ${this.renderCopyCell(user.id)}
                <td
                    @click=${() => (this.userFilter = user)}
                    class="name selectable"
                >
                    <p class="cellValue">${user.name}</p>
                </td>
                ${this.renderCell(user.email)}
                ${this.renderCell(user.howDidYouHearReason)}
                ${this.renderCell(wuTime.toDateTimeString(user.createdAt))}
                ${this.renderCell(wuTime.toDateTimeString(user.lastActiveAt))}
                ${this.renderCell(user.shotlistCount)}
                ${this.renderCell(user.templateCount)}
                ${this.renderTierCell(user)}
                <td class="noPadding clickable">
                    <input
                        type="date"
                        name="revokePro"
                        value="${user.revokeProAfter}"
                        @change=${(e: Event) => {
                            this.storeChange(
                                {
                                    id: user.id,
                                    revokeProAfter: (
                                        e.target as HTMLInputElement
                                    ).value,
                                },
                                e.target as HTMLElement
                            )
                        }}
                    />
                </td>
                ${this.renderCell(user.hasCancelled)}
                ${this.renderCopyCell(user.stripeCustomerId)}
                ${this.renderCopyCell(user.auth0Sub)}
                <td class="noPadding clickable">
                    <select
                        name="active"
                        @change=${(e: Event) => {
                            this.storeChange(
                                {
                                    id: user.id,
                                    active:
                                        (e.target as HTMLSelectElement).value ==
                                        'true',
                                },
                                e.target as HTMLElement
                            )
                        }}
                    >
                        <option value="true" .selected=${user.active}>
                            True
                        </option>
                        <option value="false" .selected=${!user.active}>
                            False
                        </option>
                    </select>
                </td>
            </tr>
        `
    }

    renderShotlist(shotlist: ShotlistDto) {
        if (!shotlist) {
            return html`<p>No shotlist data</p>`
        }
        return html`
            <tr>
                ${this.renderCopyCell(shotlist.id)}
                ${this.renderCell(shotlist.name, 'name')}
                <td
                    @click=${() =>
                        (this.userFilter = shotlist.owner as UserDto)}
                    class="selectable"
                >
                    <p class="cellValue">${shotlist.owner?.name}</p>
                </td>
                ${this.renderCell(wuTime.toDateTimeString(shotlist.createdAt))}
                ${this.renderCell(wuTime.toDateTimeString(shotlist.editedAt))}
                ${this.renderCell(shotlist.sceneCount)}
                ${this.renderCell(shotlist.shotCount)}
                ${this.renderCell(shotlist.sceneAttributeDefinitionCount)}
                ${this.renderCell(shotlist.shotAttributeDefinitionCount)}
                ${this.renderCell(shotlist.collaboratorCount)}
                ${this.renderCell(shotlist.template?.name)}
            </tr>
        `
    }

    renderTemplate(template: TemplateDto) {
        if (!template) {
            return html`<p>No template data</p>`
        }
        return html`
            <tr>
                ${this.renderCopyCell(template.id)}
                ${this.renderCell(template.name, 'name')}
                <td
                    @click=${() =>
                        (this.userFilter = template.owner as UserDto)}
                    class="selectable"
                >
                    <p class="cellValue">${template.owner?.name}</p>
                </td>
                ${this.renderCell(wuTime.toDateTimeString(template.createdAt))}
                ${this.renderCell(wuTime.toDateTimeString(template.editedAt))}
                ${this.renderCell(template.sceneAttributeCount)}
                ${this.renderCell(template.shotAttributeCount)}
            </tr>
        `
    }

    renderTierCell(user: UserDto) {
        if (!user.tier) return this.renderEmptyCell()

        let tier = user.tier

        if (this.changes.some((u) => u.id === user.id && u.tier))
            tier = this.changes.find((u) => u.id === user.id)!.tier!

        let content = html`
            <select
                name="tier"
                @change=${(e: Event) => {
                    this.storeChange(
                        {
                            id: user.id,
                            tier: UserTier[
                                (e.target as HTMLSelectElement)
                                    .value as keyof typeof UserTier
                            ],
                        },
                        e.target as HTMLElement
                    )
                }}
            >
                <option value="Basic" .selected=${tier == UserTier.Basic}>
                    Basic
                </option>
                <option value="ProFree" .selected=${tier == UserTier.ProFree}>
                    Pro Free
                </option>
                <option
                    value="ProStudent"
                    .selected=${tier == UserTier.ProStudent}
                >
                    Pro Student
                </option>
                <option value="Pro">Pro</option>
            </select>
        `

        if (tier === UserTier.Pro)
            content = html`
                Pro
                <button
                    class="revokePro"
                    @click=${(e: Event) => {
                        if (confirm(`Revoke pro tier for "${user.name}"`)) {
                            this.storeChange(
                                {
                                    id: user.id,
                                    tier: UserTier.Basic,
                                },
                                e.target as HTMLElement
                            )
                        }
                    }}
                >
                    revoke
                </button>
            `

        return html` <td class="noPadding clickable">${content}</td> `
    }

    renderCell(
        value?: Maybe<string> | Maybe<number> | Maybe<boolean>,
        className?: string
    ) {
        if (value === null || value === '' || value === undefined)
            return this.renderEmptyCell()

        return html`<td class="${className}">
            <p class="cellValue">${value}</p>
        </td>`
    }

    renderCopyCell(value?: Maybe<string> | Maybe<number> | Maybe<boolean>) {
        if (!value) return this.renderEmptyCell()

        return html`
            <td
                class="truncate copy"
                title="${value}"
                @click=${() => this.copyValue(String(value))}
            >
                <p class="cellValue">${value}</p>
            </td>
        `
    }

    renderEmptyCell() {
        return html`<td class="empty">[empty]</td>`
    }

    copyValue(value: string) {
        const notyf = new Notyf()

        notyf.success(`Copied! "${value}"`)

        navigator.clipboard.writeText(value)
    }

    async saveChanges() {
        const client = await gqlClient.get()
        const notyf = new Notyf()

        this.changes.forEach((user) => {
            let result: MutationResult
            client.subscribe(
                {
                    query: `
                        mutation UpdateUser($id: String!, $isActive: Boolean, $revokeProAfter: Date, $tier: UserTier) {
                            adminUpdateUser(updateDTO: {
                                id: $id
                                isActive: $isActive
                                revokeProAfter: $revokeProAfter
                                tier: $tier
                            }) {
                                id
                                active
                                revokeProAfter
                                tier
                            }
                        }
                     `,
                    variables: {
                        id: user.id,
                        isActive: user.active,
                        revokeProAfter: user.revokeProAfter || null,
                        tier: user.tier,
                    },
                },
                {
                    next: (data) => (result = data as MutationResult),
                    error: (e) => {
                        console.error(e)
                        notyf.error(
                            `Failed to save changes for user ${user.name}"`
                        )
                    },
                    complete: () => {
                        const newUsers = [...(this.users || [])]
                        newUsers.map((u) => {
                            if (u.id == user.id) {
                                u.active = result.data.adminUpdateUser?.active
                                u.revokeProAfter =
                                    result.data.adminUpdateUser?.revokeProAfter
                                u.tier = result.data.adminUpdateUser?.tier
                            }
                        })

                        this.users = newUsers

                        notyf.success(`Changes saved for user ${user.name}"`)
                    },
                }
            )
        })

        this.changes = []

        this.shadowRoot?.querySelectorAll('.edited').forEach((el) => {
            el.classList.remove('edited')
        })
    }

    async discardChanges() {
        if(this.changes.length <= 0) return

        const notyf = new Notyf()

        this.discard = true
        await this.updateComplete

        this.changes = []

        this.discard = false
        await this.updateComplete

        notyf.success(`Changes discarded`)
    }

    override render() {
        if (this.discard === true) {
            this.discard = false
            this.requestUpdate()
            return html``
        }

        const filteredShotlists = (this.shotlists || []).filter((s) =>
            this.userFilter?.id ? s.owner?.id == this.userFilter.id : true
        )

        const filteredTemplates = (this.templates || []).filter((t) =>
            this.userFilter?.id ? t.owner?.id == this.userFilter.id : true
        )

        return html`
            <nav>
                <img src="../Shotly-Admin.png" alt="A"/>
                <h1>Admin</h1>
                <div class="right">
                    <button
                        @click=${this.discardChanges}
                        .disabled=${this.changes.length <= 0}
                    >
                        Discard Changes
                    </button>
                    <button
                        @click=${this.saveChanges}
                        .disabled=${this.changes.length <= 0}
                    >
                        Save Changes
                    </button>
                    <button @click=${() => authService.logout()}>
                        Log Out
                    </button>
                </div>
            </nav>

            <h2 style="margin-top: 1rem">Stats</h2>
            <table class="users">
                <tr>
                    <th></th>
                    <th>1h</th>
                    <th>4h</th>
                    <th>8h</th>
                    <th>1d</th>
                    <th>7d</th>
                    <th>30d</th>
                </tr>
                ${!this.recentActiveUsers
                    ? html`<p class="empty">Loading...</p>`
                    : html`
                          <tr>
                              <th>Ac U</th>
                              <td>
                                  <p class="centered">
                                      ${this.recentActiveUsers.lastHour}
                                  </p>
                              </td>
                              <td>
                                  <p class="centered">
                                      ${this.recentActiveUsers.fourHours}
                                  </p>
                              </td>
                              <td>
                                  <p class="centered">
                                      ${this.recentActiveUsers.eightHours}
                                  </p>
                              </td>
                              <td>
                                  <p class="centered">
                                      ${this.recentActiveUsers.twentyFourHours}
                                  </p>
                              </td>
                              <td>
                                  <p class="centered">
                                      ${this.recentActiveUsers.sevenDays}
                                  </p>
                              </td>
                              <td>
                                  <p class="centered">
                                      ${this.recentActiveUsers.thirtyDays}
                                  </p>
                              </td>
                          </tr>
                      `}
                ${!this.recentCreatedUsers
                    ? html`<p class="empty">Loading...</p>`
                    : html`
                          <tr>
                              <th>Cr U</th>
                              <td>
                                  <p class="centered">
                                      ${this.recentCreatedUsers.lastHour}
                                  </p>
                              </td>
                              <td>
                                  <p class="centered">
                                      ${this.recentCreatedUsers.fourHours}
                                  </p>
                              </td>
                              <td>
                                  <p class="centered">
                                      ${this.recentCreatedUsers.eightHours}
                                  </p>
                              </td>
                              <td>
                                  <p class="centered">
                                      ${this.recentCreatedUsers.twentyFourHours}
                                  </p>
                              </td>
                              <td>
                                  <p class="centered">
                                      ${this.recentCreatedUsers.sevenDays}
                                  </p>
                              </td>
                              <td>
                                  <p class="centered">
                                      ${this.recentCreatedUsers.thirtyDays}
                                  </p>
                              </td>
                          </tr>
                      `}
                ${!this.recentCreatedShotlists
                    ? html`<p class="empty">Loading...</p>`
                    : html`
                          <tr>
                              <th>Cr S</th>
                              <td>
                                  <p class="centered">
                                      ${this.recentCreatedShotlists.lastHour}
                                  </p>
                              </td>
                              <td>
                                  <p class="centered">
                                      ${this.recentCreatedShotlists.fourHours}
                                  </p>
                              </td>
                              <td>
                                  <p class="centered">
                                      ${this.recentCreatedShotlists.eightHours}
                                  </p>
                              </td>
                              <td>
                                  <p class="centered">
                                      ${this.recentCreatedShotlists.twentyFourHours}
                                  </p>
                              </td>
                              <td>
                                  <p class="centered">
                                      ${this.recentCreatedShotlists.sevenDays}
                                  </p>
                              </td>
                              <td>
                                  <p class="centered">
                                      ${this.recentCreatedShotlists.thirtyDays}
                                  </p>
                              </td>
                          </tr>
                      `}
            </table>

            <div class="heading">
                <h2>Users</h2>
                <p>(${this.users?.length || 0})</p>
                <select
                  @change=${(e: Event) => {
                    this.discardChanges()
                    this.selectedUserSort =
                      SortName[
                        (e.target as HTMLSelectElement)
                          .value as keyof typeof SortName
                        ]
                  }}
                >
                  <option value="Name" selected>Name</option>
                  <option value="CreatedAt">Oldest</option>
                  <option value="CreatedAtReverse">Newest</option>
                  <option value="ActiveAt">Active At</option>
                  <option value="Tier">Tier</option>
                </select>
                <input type="text" placeholder="search" @input=${(e: Event) => {
                  this.discardChanges()
                  this.userSearchQuery = (e.target as HTMLInputElement).value
                }}>
            </div>
            <div class="scrollArea">
                <table>
                    <tr class="sticky">
                        <th>Id</th>
                        <th class="name">Name</th>
                        <th>Email</th>
                        <th>How did you hear</th>
                        <th>Created</th>
                        <th>Active</th>
                        <th>Shotlists</th>
                        <th>Template</th>
                        <th>Tier</th>
                        <th>Revoke pro after</th>
                        <th>Has cancelled</th>
                        <th>Stripe Id</th>
                        <th>Auth Id</th>
                        <th>Active</th>
                    </tr>
                    ${!this.users
                        ? html`<p class="empty">Loading...</p>`
                        : this.users
                            .sort(this.sorts.get(this.selectedUserSort))
                            .filter(u => 
                              u.name?.toUpperCase().includes(this.userSearchQuery.toUpperCase()) || 
                              this.userSearchQuery.toUpperCase().includes(u.name?.toUpperCase() || "")
                            )
                            .map((u) => {
                                return this.renderUser(u)
                            })}
                </table>
            </div>

            <div class="heading">
                <h2>Shotlists</h2>
                <p>(${filteredShotlists.length})</p>
                ${this.userFilter
                    ? html`
                          <p>(${this.userFilter.name})</p>
                          <button @click=${() => (this.userFilter = null)}>
                              Clear
                          </button>
                      `
                    : html`<p>(all)</p>`}
            </div>
            <div class="scrollArea">
                <table>
                    <tr class="sticky">
                        <th>Id</th>
                        <th class="name">Name</th>
                        <th>Owner</th>
                        <th>Created</th>
                        <th>Edited</th>
                        <th>Scenes</th>
                        <th>Shots</th>
                        <th>Scene Attr Defs</th>
                        <th>Shot Attr Defs</th>
                        <th>Collaborators</th>
                        <th>Template</th>
                    </tr>
                    ${!this.shotlists
                        ? html`<p class="empty">Loading..</p>`
                        : filteredShotlists.length <= 0
                        ? html`<p class="empty">No results</p>`
                        : filteredShotlists.map((s) => {
                              return this.renderShotlist(s)
                          })}
                </table>
            </div>
            <div class="heading">
                <h2>Templates</h2>
                <p>(${filteredTemplates.length})</p>
                ${this.userFilter
                    ? html`
                          <p>(${this.userFilter.name})</p>
                          <button @click=${() => (this.userFilter = null)}>
                              Clear
                          </button>
                      `
                    : html`<p>(all)</p>`}
            </div>
            <div class="scrollArea">
                <table>
                    <tr class="sticky">
                        <th>Id</th>
                        <th class="name">Name</th>
                        <th>Owner</th>
                        <th>Created</th>
                        <th>Edited</th>
                        <th>Scene Attributes</th>
                        <th>Shot Attributes</th>
                    </tr>
                    ${!this.templates
                        ? html`<p class="empty">Loading..</p>`
                        : filteredTemplates.length <= 0
                        ? html`<p class="empty">No results</p>`
                        : filteredTemplates.map((t) => {
                              return this.renderTemplate(t)
                          })}
                </table>
            </div>
        `
    }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-dashboard': Dashboard;
  }
}
