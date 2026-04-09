import{f as Y,u as R,b as I,C as B,i as X,a as J,c as l,t as q}from"./AuthService-CC0HzVsX.js";const V={attribute:!0,type:String,converter:R,reflect:!1,hasChanged:Y},G=(r=V,t,e)=>{const{kind:i,metadata:n}=e;let s=globalThis.litPropertyMetadata.get(n);if(s===void 0&&globalThis.litPropertyMetadata.set(n,s=new Map),i==="setter"&&((r=Object.create(r)).wrapped=!0),s.set(e.name,r),i==="accessor"){const{name:o}=e;return{set(c){const d=t.get.call(this);t.set.call(this,c),this.requestUpdate(o,d,r,!0,c)},init(c){return c!==void 0&&this.C(o,void 0,r,c),c}}}if(i==="setter"){const{name:o}=e;return function(c){const d=this[o];t.call(this,c),this.requestUpdate(o,d,r,!0,c)}}throw Error("Unsupported decorator location: "+i)};function Z(r){return(t,e)=>typeof e=="object"?G(r,t,e):((i,n,s)=>{const o=n.hasOwnProperty(s);return n.constructor.createProperty(s,i),o?Object.getOwnPropertyDescriptor(n,s):void 0})(r,t,e)}function A(r){return Z({...r,state:!0,attribute:!1})}function W(r){return typeof r=="object"&&r!==null}function Q(r){const{credentials:t="same-origin",referrer:e,referrerPolicy:i,shouldRetry:n=()=>!1}=r,s=r.fetchFn||fetch,o=r.abortControllerImpl||AbortController,c=(()=>{let d=!1;const u=[];return{get disposed(){return d},onDispose(h){return d?(setTimeout(()=>h(),0),()=>{}):(u.push(h),()=>{u.splice(u.indexOf(h),1)})},dispose(){if(!d){d=!0;for(const h of[...u])h()}}}})();return{subscribe(d,u){if(c.disposed)throw new Error("Client has been disposed");const h=new o,D=c.onDispose(()=>{D(),h.abort()});return(async()=>{var C;let N=null,M=0;for(;;){if(N){const m=await n(N,M);if(h.signal.aborted)return;if(!m)throw N;M++}try{const m=typeof r.url=="function"?await r.url(d):r.url;if(h.signal.aborted)return;const k=typeof r.headers=="function"?await r.headers():(C=r.headers)!==null&&C!==void 0?C:{};if(h.signal.aborted)return;let y;try{y=await s(m,{signal:h.signal,method:"POST",headers:Object.assign(Object.assign({},k),{"content-type":"application/json; charset=utf-8",accept:"application/graphql-response+json, application/json"}),credentials:t,referrer:e,referrerPolicy:i,body:JSON.stringify(d)})}catch(L){throw new H(L)}if(!y.ok)throw new H(y);if(!y.body)throw new Error("Missing response body");const w=y.headers.get("content-type");if(!w)throw new Error("Missing response content-type");if(!w.includes("application/graphql-response+json")&&!w.includes("application/json"))throw new Error(`Unsupported response content-type ${w}`);const E=await y.json();return u.next(E),h.abort()}catch(m){if(h.signal.aborted)return;if(!(m instanceof H))throw m;N=m}}})().then(()=>u.complete()).catch(C=>u.error(C)),()=>h.abort()},dispose(){c.dispose()}}}class H extends Error{constructor(t){let e,i;K(t)?(i=t,e="Server responded with "+t.status+": "+t.statusText):t instanceof Error?e=t.message:e=String(t),super(e),this.name=this.constructor.name,this.response=i}}function K(r){return W(r)&&typeof r.ok=="boolean"&&typeof r.status=="number"&&typeof r.statusText=="string"}const U=class U{static async get(){return this.client?this.client:(await I.silentAuth(),this.client=Q({url:B.backendURL+"/graphql",headers:{Authorization:`Bearer ${I.getIdToken()}`}}),this.client)}};U.client=null;let F=U;var T=(r=>(r.Basic="BASIC",r.Pro="PRO",r.ProFree="PRO_FREE",r.ProStudent="PRO_STUDENT",r))(T||{});class a{}a.Regex={anyThingButNumbers:/\D/,empty:/^\s*$/,onlySpecialChars:/^[^a-zA-Z0-9]*$/,onlyNumbersOrLetters:/^[a-zA-Z0-9]*$/,onlyNumbers:/^[0-9]*$/,onlyLetters:/^[a-zA-Z]*$/,email:/^[\w\-\.]+@([\w-]+\.)+[\w-]{2,}$/,UUID:/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i};a.Time={msPerSecond:1e3,msPerMinute:1e3*60,msPerHour:1e3*60*60,msPerDay:1e3*60*60*24,msPerMonth:1e3*60*60*24*30,msPerYear:1e3*60*60*24*30*12,englishMonths:["January","February","March","April","May","June","July","August","September","October","November","December"],germanMonths:["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"]};a.Alphabet={upper:"ABCDEFGHIJKLMNOPQRSTUVWXYZ",lower:"abcdefghijklmnopqrstuvwxyz"};a.ImperialUnits={length:{inchesPerTwip:1/1440,inchesPerMil:1/1e3,inchesPerPoint:1/72,inchesPerPica:1/6,inchesPerFoot:12,inchesPerYard:36,inchesPerMile:5280,inchesPerLeague:15840},weight:{poundsPerGrain:1/7e3,poundsPerDram:1/256,poundsPerOunce:1/16,poundsPerShortHundredWeight:100,poundsPerLongHundredWeight:112,poundsPerShortTon:2e3,poundsPerLongTon:2240},volume:{gallonsPerBarrel:31.5,gallonsPerBushel:8,gallonsPerFluidOunce:128,gallonsPerPint:8,gallonsPerQuart:4,gallonsPerCup:16,gallonsPerTeaspoon:768,gallonsPerTablespoon:256}};a.ImperialToMetric={millimetersPerInch:25.4,gramsPerPound:453.59237,litersPerGallon:3.78541};a.MetricToImperial={inchesPerMillimeter:1/a.ImperialToMetric.millimetersPerInch,poundsPerGram:1/a.ImperialToMetric.gramsPerPound};a.Trivia={unMemberCount:193,whoMemberCount:194,isoMemberCount:249,octopusHeartCount:3,octopusBloodColor:"blue"};class f{static pad(t,e=2,i=" ",n="left"){let s=String(t);return n=="left"?s.padStart(e,i):s.padEnd(e,i)}static roundNumber(t,e){return t.toFixed(e)}static clamp(t,e,i){return Math.min(Math.max(e,t),i)}static truncate(t,e=15,i="...",n=!0,s=2){return t?t.length<=e+s?t:n?t.substring(0,e).trim()+i:t.substring(0,e)+i:""}static truncateCenter(t,e=8,i=8,n="...",s=2){return t?t.length<=e+i+s?t:t.substring(0,e)+n+t.substring(t.length-i,t.length):null}static numberToLetter(t,e="upper"){return t==null?null:(t=this.wrapNumber(t,0,25),e=="lower"?a.Alphabet.lower[t]:a.Alphabet.upper[t])}static wrapNumber(t,e,i){if(t==null)return null;let n=i-e+1;if(t<e){let s=(t-e)%n;return s==0?e:i+s+1}else return t>i?e+(t-e)%n:t}static upperOrLowerRange(t,e,i,n="upper"){if(!t)return null;let s=t.substring(0,e),o=t.substring(e,i+1),c=t.substring(i+1);return n=="upper"?o=o.toUpperCase():o=o.toLowerCase(),s+o+c}static booleanToYesNo(t){return t?t?"Yes":"No":null}}class j{static toSplitPieces(t){let e=t/a.Time.msPerYear,i=t%a.Time.msPerYear/a.Time.msPerMonth,n=t%a.Time.msPerMonth/a.Time.msPerDay,s=t%a.Time.msPerDay/a.Time.msPerHour,o=t%a.Time.msPerHour/a.Time.msPerMinute,c=t%a.Time.msPerMinute/a.Time.msPerSecond,d=t%a.Time.msPerSecond;return{years:Math.floor(e),months:Math.floor(i),days:Math.floor(n),hours:Math.floor(s),minutes:Math.floor(o),seconds:Math.floor(c),milliseconds:Math.floor(d)}}static toAbsolutePieces(t){return{years:t/a.Time.msPerYear,months:t/a.Time.msPerMonth,days:t/a.Time.msPerDay,hours:t/a.Time.msPerHour,minutes:t/a.Time.msPerMinute,seconds:t/a.Time.msPerSecond,milliseconds:t}}static toDurationString(t,e={}){const{precision:i=2,separator:n=", "}=e,s=this.toSplitPieces(t);let o;return s.years>1?o=[s.years+" year(s)",s.months+" month(s)",s.days+"day(s)"]:s.months>0?o=[s.months+" month(s)",s.days+" day(s)",s.hours+" hour(s)"]:s.days>0?o=[s.days+" day(s)",s.hours+" hour(s)",s.minutes+" minute(s)"]:s.hours>0?o=[s.hours+" hour(s)",s.minutes+" minute(s)",s.seconds+" second(s)"]:s.minutes>0?o=[s.minutes+" minute(s)",s.seconds+" second(s)",s.milliseconds+" millisecond(s)"]:s.seconds>0?o=[s.seconds+" second(s)",s.milliseconds+" millisecond(s)",""]:o=[s.milliseconds+" milliseconds","",""],o.slice(0,i).join(n)}static toDateTimeString(t,e={}){const{dateTimeSeparator:i=" "}=e;return this.toDateString(t,{dateSeparator:e.dateSeparator,yearDigits:e.yearDigits})+i+this.toTimeString(t,{timeSeparator:e.timeSeparator,showMilliseconds:e.showMilliseconds})}static toDateString(t,e={}){const{dateSeparator:i=".",yearDigits:n=2}=e,s=this.toSplitPieces(t);let o=s.years.toString();return n==2&&o.length>2&&(o=o.substring(2,4)),f.pad(s.days,2,"0")+i+f.pad(s.months+1,2,"0")+i+f.pad(o,2,"0")}static toTimeString(t,e={}){const{timeSeparator:i=":",showMilliseconds:n=!1}=e,s=this.toSplitPieces(t);let o=f.pad(s.hours,2,"0")+i+f.pad(s.minutes,2,"0");return n&&(o+=i+f.pad(s.seconds,2,"0")),o}static difference(t,e){return e-t}}class S{static handleInvalid(t,e,i){const n=this.anyToDate(t);return n?e(n):i}static anyToDate(t){if(t==null)return null;if(t instanceof Date)return isNaN(t.getTime())?null:t;const e=new Date(t);return isNaN(e.getTime())?null:e}static toSplitPieces(t){let e=this.anyToDate(t);return e?{years:e.getFullYear(),months:e.getMonth()+1,days:e.getDate(),hours:e.getHours(),minutes:e.getMinutes(),seconds:e.getSeconds(),milliseconds:e.getMilliseconds()}:null}static toRelativeString(t,e={}){const i=this.anyToDate(t);if(!i)return null;const{precision:n=2,separator:s=", "}=e;return Date.now()>i.valueOf()?j.toDurationString(this.difference(t,new Date),{precision:n,separator:s})+" ago":j.toDurationString(this.difference(new Date,t),{precision:n,separator:s})+" from now"}static toDateTimeString(t,e={}){if(!this.anyToDate(t))return null;const{dateTimeSeparator:i=" "}=e;return this.toDateString(t,{dateSeparator:e.dateSeparator,yearDigits:e.yearDigits})+i+this.toTimeString(t,{timeSeparator:e.timeSeparator,showMilliseconds:e.showMilliseconds})}static toDateString(t,e={}){const i=this.anyToDate(t);if(!i)return null;const{dateSeparator:n=".",yearDigits:s=2}=e;let o=i.getFullYear().toString();return s==2&&o.length>2&&(o=o.substring(2,4)),f.pad(i.getDate(),2,"0")+n+f.pad(i.getMonth()+1,2,"0")+n+f.pad(o,2,"0")}static toTimeString(t,e={}){const i=this.anyToDate(t);if(!i)return null;const{timeSeparator:n=":",showMilliseconds:s=!1}=e;let o=f.pad(i.getHours(),2,"0")+n+f.pad(i.getMinutes(),2,"0");return s&&(o+=n+f.pad(i.getSeconds(),2,"0")),o}static difference(t,e){const i=this.anyToDate(t),n=this.anyToDate(e);return!i||!n?null:n.valueOf()-i.valueOf()}static timezoneOffset(){return new Date().getTimezoneOffset()*a.Time.msPerMinute}}var p=function(){return p=Object.assign||function(t){for(var e,i=1,n=arguments.length;i<n;i++){e=arguments[i];for(var s in e)Object.prototype.hasOwnProperty.call(e,s)&&(t[s]=e[s])}return t},p.apply(this,arguments)},tt=(function(){function r(t){this.options=t,this.listeners={}}return r.prototype.on=function(t,e){var i=this.listeners[t]||[];this.listeners[t]=i.concat([e])},r.prototype.triggerEvent=function(t,e){var i=this,n=this.listeners[t]||[];n.forEach(function(s){return s({target:i,event:e})})},r})(),_;(function(r){r[r.Add=0]="Add",r[r.Remove=1]="Remove"})(_||(_={}));var et=(function(){function r(){this.notifications=[]}return r.prototype.push=function(t){this.notifications.push(t),this.updateFn(t,_.Add,this.notifications)},r.prototype.splice=function(t,e){var i=this.notifications.splice(t,e)[0];return this.updateFn(i,_.Remove,this.notifications),i},r.prototype.indexOf=function(t){return this.notifications.indexOf(t)},r.prototype.onUpdate=function(t){this.updateFn=t},r})(),v;(function(r){r.Dismiss="dismiss",r.Click="click"})(v||(v={}));var z={types:[{type:"success",className:"notyf__toast--success",backgroundColor:"#3dc763",icon:{className:"notyf__icon--success",tagName:"i"}},{type:"error",className:"notyf__toast--error",backgroundColor:"#ed3d3d",icon:{className:"notyf__icon--error",tagName:"i"}}],duration:2e3,ripple:!0,position:{x:"right",y:"bottom"},dismissible:!1},rt=(function(){function r(){this.notifications=[],this.events={},this.X_POSITION_FLEX_MAP={left:"flex-start",center:"center",right:"flex-end"},this.Y_POSITION_FLEX_MAP={top:"flex-start",center:"center",bottom:"flex-end"};var t=document.createDocumentFragment(),e=this._createHTMLElement({tagName:"div",className:"notyf"});t.appendChild(e),document.body.appendChild(t),this.container=e,this.animationEndEventName=this._getAnimationEndEventName(),this._createA11yContainer()}return r.prototype.on=function(t,e){var i;this.events=p(p({},this.events),(i={},i[t]=e,i))},r.prototype.update=function(t,e){e===_.Add?this.addNotification(t):e===_.Remove&&this.removeNotification(t)},r.prototype.removeNotification=function(t){var e=this,i=this._popRenderedNotification(t),n;if(i){n=i.node,n.classList.add("notyf__toast--disappear");var s;n.addEventListener(this.animationEndEventName,s=function(o){o.target===n&&(n.removeEventListener(e.animationEndEventName,s),e.container.removeChild(n))})}},r.prototype.addNotification=function(t){var e=this._renderNotification(t);this.notifications.push({notification:t,node:e}),this._announce(t.options.message||"Notification")},r.prototype._renderNotification=function(t){var e,i=this._buildNotificationCard(t),n=t.options.className;return n&&(e=i.classList).add.apply(e,n.split(" ")),this.container.appendChild(i),i},r.prototype._popRenderedNotification=function(t){for(var e=-1,i=0;i<this.notifications.length&&e<0;i++)this.notifications[i].notification===t&&(e=i);if(e!==-1)return this.notifications.splice(e,1)[0]},r.prototype.getXPosition=function(t){var e;return((e=t?.position)===null||e===void 0?void 0:e.x)||"right"},r.prototype.getYPosition=function(t){var e;return((e=t?.position)===null||e===void 0?void 0:e.y)||"bottom"},r.prototype.adjustContainerAlignment=function(t){var e=this.X_POSITION_FLEX_MAP[this.getXPosition(t)],i=this.Y_POSITION_FLEX_MAP[this.getYPosition(t)],n=this.container.style;n.setProperty("justify-content",i),n.setProperty("align-items",e)},r.prototype._buildNotificationCard=function(t){var e=this,i=t.options,n=i.icon;this.adjustContainerAlignment(i);var s=this._createHTMLElement({tagName:"div",className:"notyf__toast"}),o=this._createHTMLElement({tagName:"div",className:"notyf__ripple"}),c=this._createHTMLElement({tagName:"div",className:"notyf__wrapper"}),d=this._createHTMLElement({tagName:"div",className:"notyf__message"});d.innerHTML=i.message||"";var u=i.background||i.backgroundColor;if(n){var h=this._createHTMLElement({tagName:"div",className:"notyf__icon"});if((typeof n=="string"||n instanceof String)&&(h.innerHTML=new String(n).valueOf()),typeof n=="object"){var D=n.tagName,C=D===void 0?"i":D,N=n.className,M=n.text,m=n.color,k=m===void 0?u:m,y=this._createHTMLElement({tagName:C,className:N,text:M});k&&(y.style.color=k),h.appendChild(y)}c.appendChild(h)}if(c.appendChild(d),s.appendChild(c),u&&(i.ripple?(o.style.background=u,s.appendChild(o)):s.style.background=u),i.dismissible){var w=this._createHTMLElement({tagName:"div",className:"notyf__dismiss"}),E=this._createHTMLElement({tagName:"button",className:"notyf__dismiss-btn"});w.appendChild(E),c.appendChild(w),s.classList.add("notyf__toast--dismissible"),E.addEventListener("click",function(O){var $,P;(P=($=e.events)[v.Dismiss])===null||P===void 0||P.call($,{target:t,event:O}),O.stopPropagation()})}s.addEventListener("click",function(O){var $,P;return(P=($=e.events)[v.Click])===null||P===void 0?void 0:P.call($,{target:t,event:O})});var L=this.getYPosition(i)==="top"?"upper":"lower";return s.classList.add("notyf__toast--"+L),s},r.prototype._createHTMLElement=function(t){var e=t.tagName,i=t.className,n=t.text,s=document.createElement(e);return i&&(s.className=i),s.textContent=n||null,s},r.prototype._createA11yContainer=function(){var t=this._createHTMLElement({tagName:"div",className:"notyf-announcer"});t.setAttribute("aria-atomic","true"),t.setAttribute("aria-live","polite"),t.style.border="0",t.style.clip="rect(0 0 0 0)",t.style.height="1px",t.style.margin="-1px",t.style.overflow="hidden",t.style.padding="0",t.style.position="absolute",t.style.width="1px",t.style.outline="0",document.body.appendChild(t),this.a11yContainer=t},r.prototype._announce=function(t){var e=this;this.a11yContainer.textContent="",setTimeout(function(){e.a11yContainer.textContent=t},100)},r.prototype._getAnimationEndEventName=function(){var t=document.createElement("_fake"),e={MozTransition:"animationend",OTransition:"oAnimationEnd",WebkitTransition:"webkitAnimationEnd",transition:"animationend"},i;for(i in e)if(t.style[i]!==void 0)return e[i];return"animationend"},r})(),x=(function(){function r(t){var e=this;this.dismiss=this._removeNotification,this.notifications=new et,this.view=new rt;var i=this.registerTypes(t);this.options=p(p({},z),t),this.options.types=i,this.notifications.onUpdate(function(n,s){return e.view.update(n,s)}),this.view.on(v.Dismiss,function(n){var s=n.target,o=n.event;e._removeNotification(s),s.triggerEvent(v.Dismiss,o)}),this.view.on(v.Click,function(n){var s=n.target,o=n.event;return s.triggerEvent(v.Click,o)})}return r.prototype.error=function(t){var e=this.normalizeOptions("error",t);return this.open(e)},r.prototype.success=function(t){var e=this.normalizeOptions("success",t);return this.open(e)},r.prototype.open=function(t){var e=this.options.types.find(function(s){var o=s.type;return o===t.type})||{},i=p(p({},e),t);this.assignProps(["ripple","position","dismissible"],i);var n=new tt(i);return this._pushNotification(n),n},r.prototype.dismissAll=function(){for(;this.notifications.splice(0,1););},r.prototype.assignProps=function(t,e){var i=this;t.forEach(function(n){e[n]=e[n]==null?i.options[n]:e[n]})},r.prototype._pushNotification=function(t){var e=this;this.notifications.push(t);var i=t.options.duration!==void 0?t.options.duration:this.options.duration;i&&setTimeout(function(){return e._removeNotification(t)},i)},r.prototype._removeNotification=function(t){var e=this.notifications.indexOf(t);e!==-1&&this.notifications.splice(e,1)},r.prototype.normalizeOptions=function(t,e){var i={type:t};return typeof e=="string"?i.message=e:typeof e=="object"&&(i=p(p({},i),e)),i},r.prototype.registerTypes=function(t){var e=(t&&t.types||[]).slice(),i=z.types.map(function(n){var s=-1;e.forEach(function(c,d){c.type===n.type&&(s=d)});var o=s!==-1?e.splice(s,1)[0]:{};return p(p({},n),o)});return i.concat(e)},r})(),it=Object.defineProperty,nt=Object.getOwnPropertyDescriptor,b=(r,t,e,i)=>{for(var n=i>1?void 0:i?nt(t,e):t,s=r.length-1,o;s>=0;s--)(o=r[s])&&(n=(i?o(t,e,n):o(n))||n);return i&&n&&it(t,e,n),n};let g=class extends J{constructor(){super(...arguments),this.users=null,this.shotlists=null,this.templates=null,this.userActivity=null,this.changes=[],this.discard=!1,this.userFilter=null}connectedCallback(){super.connectedCallback(),this.getData()}async getData(){const r=await F.get(),t=await new Promise((i,n)=>{let s;r.subscribe({query:`{ 
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
                        userActivity{
                            lastHour
                            fourHours
                            eightHours
                            twentyFourHours
                            sevenDays
                            thirtyDays
                        }
                    }`},{next:o=>s=o,error:n,complete:()=>i(s)})});console.log(t),this.users=t.data.users||[],this.shotlists=t.data.allShotlists||[],this.templates=t.data.allTemplates||[],this.userActivity=t.data.userActivity||{};const e=new x;t.errors&&e.error(`Failed to load data - ${t.errors[0].extensions.code}`)}storeChange(r,t){const e=this.changes.findIndex(n=>n.id===r.id);if(e>=0){const n=[...this.changes];n[e]={...n[e],...r},this.changes=n}else this.changes=[...this.changes,r];const i=t.closest("td");i&&i.classList.add("edited")}renderUser(r){return r?l`
            <tr>
                ${this.renderCopyCell(r.id)}
                <td
                    @click=${()=>this.userFilter=r}
                    class="name clickable"
                >
                    ${r.name}
                </td>
                ${this.renderCell(r.email)}
                ${this.renderCell(r.howDidYouHearReason)}
                ${this.renderCell(S.toDateTimeString(r.createdAt))}
                ${this.renderCell(S.toDateTimeString(r.lastActiveAt))}
                ${this.renderCell(r.shotlistCount)}
                ${this.renderCell(r.templateCount)}
                ${this.renderTierCell(r)}
                <td class="noPadding clickable">
                    <input
                        type="date"
                        name="revokePro"
                        value="${r.revokeProAfter}"
                        @change=${t=>{this.storeChange({id:r.id,revokeProAfter:t.target.value},t.target)}}
                    />
                </td>
                ${this.renderCell(r.hasCancelled)}
                ${this.renderCopyCell(r.stripeCustomerId)}
                ${this.renderCopyCell(r.auth0Sub)}
                <td class="noPadding clickable">
                    <select
                        name="active"
                        @change=${t=>{this.storeChange({id:r.id,active:t.target.value=="true"},t.target)}}
                    >
                        <option value="true" .selected=${r.active}>
                            True
                        </option>
                        <option value="false" .selected=${!r.active}>
                            False
                        </option>
                    </select>
                </td>
            </tr>
        `:l`<p>No user data</p>`}renderShotlist(r){return r?l`
            <tr>
                ${this.renderCopyCell(r.id)}
                ${this.renderCell(r.name,"name")}
                ${this.renderCell(r.owner?.name)}
                ${this.renderCell(S.toDateTimeString(r.createdAt))}
                ${this.renderCell(S.toDateTimeString(r.editedAt))}
                ${this.renderCell(r.sceneCount)}
                ${this.renderCell(r.shotCount)}
                ${this.renderCell(r.sceneAttributeDefinitionCount)}
                ${this.renderCell(r.shotAttributeDefinitionCount)}
                ${this.renderCell(r.collaboratorCount)}
                ${this.renderCell(r.template?.name)}
            </tr>
        `:l`<p>No shotlist data</p>`}renderTemplate(r){return r?l`
            <tr>
                ${this.renderCopyCell(r.id)}
                ${this.renderCell(r.name,"name")}
                ${this.renderCell(r.owner?.name)}
                ${this.renderCell(S.toDateTimeString(r.createdAt))}
                ${this.renderCell(S.toDateTimeString(r.editedAt))}
                ${this.renderCell(r.sceneAttributeCount)}
                ${this.renderCell(r.shotAttributeCount)}
            </tr>
        `:l`<p>No template data</p>`}renderTierCell(r){if(!r.tier)return this.renderEmptyCell();let t=r.tier;this.changes.some(i=>i.id===r.id&&i.tier)&&(t=this.changes.find(i=>i.id===r.id).tier);let e=l`
            <select
                name="tier"
                @change=${i=>{this.storeChange({id:r.id,tier:T[i.target.value]},i.target)}}
            >
                <option value="Basic" .selected=${t==T.Basic}>
                    Basic
                </option>
                <option value="ProFree" .selected=${t==T.ProFree}>
                    Pro Free
                </option>
                <option
                    value="ProStudent"
                    .selected=${t==T.ProStudent}
                >
                    Pro Student
                </option>
                <option value="Pro">Pro</option>
            </select>
        `;return t===T.Pro&&(e=l`
                Pro
                <button
                    class="revokePro"
                    @click=${i=>{confirm(`Revoke pro tier for "${r.name}"`)&&this.storeChange({id:r.id,tier:T.Basic},i.target)}}
                >
                    revoke
                </button>
            `),l` <td class="noPadding clickable">${e}</td> `}renderCell(r,t){return r===null||r===""||r===void 0?this.renderEmptyCell():l`<td class="${t}">${r}</td>`}renderCopyCell(r){return r?l`
            <td
                class="truncate copy"
                title="${r}"
                @click=${()=>this.copyValue(String(r))}
            >
                ${r}
            </td>
        `:this.renderEmptyCell()}renderEmptyCell(){return l`<td class="empty">[empty]</td>`}copyValue(r){new x().success(`Copied! "${r}"`),navigator.clipboard.writeText(r)}async saveChanges(){const r=await F.get(),t=new x;this.changes.forEach(e=>{let i;r.subscribe({query:`
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
                     `,variables:{id:e.id,isActive:e.active,revokeProAfter:e.revokeProAfter||null,tier:e.tier}},{next:n=>i=n,error:n=>{console.log(n),t.error(`Failed to save changes for user ${e.name}"`)},complete:()=>{const n=[...this.users||[]];n.map(s=>{s.id==e.id&&(s.active=i.data.adminUpdateUser?.active,s.revokeProAfter=i.data.adminUpdateUser?.revokeProAfter,s.tier=i.data.adminUpdateUser?.tier)}),console.log(i.data.adminUpdateUser),this.users=n,t.success(`Changes saved for user ${e.name}"`)}})}),this.changes=[],this.shadowRoot?.querySelectorAll(".edited").forEach(e=>{e.classList.remove("edited")})}async discardChanges(){const r=new x;this.discard=!0,await this.updateComplete,this.changes=[],this.discard=!1,await this.updateComplete,r.success("Changes discarded")}render(){if(this.discard===!0)return this.discard=!1,this.requestUpdate(),l``;const r=(this.shotlists||[]).filter(e=>this.userFilter?.id?e.owner?.id==this.userFilter.id:!0),t=(this.templates||[]).filter(e=>this.userFilter?.id?e.owner?.id==this.userFilter.id:!0);return l`
            <div class="top">
                <h1>Admin</h1>
                <div class="right">
                    <button
                        @click=${this.discardChanges}
                        .disabled=${this.changes.length<=0}
                    >
                        Discard Changes
                    </button>
                    <button
                        @click=${this.saveChanges}
                        .disabled=${this.changes.length<=0}
                    >
                        Save Changes
                    </button>
                    <button @click=${()=>I.logout()}>
                        Log Out
                    </button>
                </div>
            </div>
            
            <h2 style="margin-top: 1rem">Active Users</h2>
            <table>
                <tr>
                    <th>1h</th>
                    <th>4h</th>
                    <th>8h</th>
                    <th>1d</th>
                    <th>7d</th>
                    <th>30d</th>
                </tr>
                ${this.userActivity?l`
                        <tr>
                            <td>${this.userActivity.lastHour}</td>
                            <td>${this.userActivity.fourHours}</td>
                            <td>${this.userActivity.eightHours}</td>
                            <td>${this.userActivity.twentyFourHours}</td>
                            <td>${this.userActivity.sevenDays}</td>
                            <td>${this.userActivity.thirtyDays}</td>
                        </tr>
                `:l`<p class="empty">Loading...</p>`}
            </table>
            
            <h2 style="margin-top: 1rem">Users</h2>
            <div class="scrollArea">
                <table>
                    <tr>
                        <th>Id</th>
                        <th class="name">Name</th>
                        <th>Email</th>
                        <th>How did you hear</th>
                        <th>Created</th>
                        <th>Active</th>
                        <th>shotlists</th>
                        <th>template</th>
                        <th>Tier</th>
                        <th>Revoke pro after</th>
                        <th>Has cancelled</th>
                        <th>Stripe Id</th>
                        <th>Auth Id</th>
                        <th>Active</th>
                    </tr>
                    ${this.users?this.users.map(e=>this.renderUser(e)):l`<p class="empty">Loading...</p>`}
                </table>
            </div>

            <div class="heading">
                <h2>Shotlists</h2>
                ${this.userFilter?l`
                        <p>(${this.userFilter.name})</p>
                        <button @click=${()=>this.userFilter=null}>
                            Clear
                        </button>
                    `:l`<p>(all)</p>`}
            </div>
            <div class="scrollArea">
                <table>
                    <tr>
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
                    ${this.shotlists?r.length<=0?l`<p class="empty">No results</p>`:r.map(e=>this.renderShotlist(e)):l`<p class="empty">Loading..</p>`}
                </table>
            </div>
            <div class="heading">
                <h2>Templates</h2>
                ${this.userFilter?l`
                        <p>(${this.userFilter.name})</p>
                        <button
                            @click=${()=>this.userFilter=null}
                        >
                            Clear
                        </button>
                    `:l`<p>(all)</p>`}
            </div>
            <div class="scrollArea">
                <table>
                    <tr>
                        <th>Id</th>
                        <th class="name">Name</th>
                        <th>Owner</th>
                        <th>Created</th>
                        <th>Edited</th>
                        <th>Scene Attributes</th>
                        <th>Shot Attributes</th>
                    </tr>
                    ${this.templates?t.length<=0?l`<p class="empty">No results</p>`:t.map(e=>this.renderTemplate(e)):l`<p class="empty">Loading..</p>`}
                </table>
            </div>
        `}};g.styles=X`
        :host {
            font-family: system-ui, sans-serif;
            color: hsl(0, 0%, 90%);
            overflow-x: hidden;
            display: flex;
            flex-direction: column;
            padding: 0.5rem;
        }

        * {
            padding: 0;
            margin: 0;
            box-sizing: border-box;
        }

        button {
            background-color: hsl(0, 0%, 20%);
            border: none;
            padding: 0.5rem;
            height: fit-content;
            color: white;
            font-weight: bold;
            cursor: pointer;

            &:hover {
                background-color: hsl(0, 0%, 30%);
            }

            &[disabled] {
                opacity: 0.5;
                pointer-events: none;
            }
        }

        .top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: .5rem;

            .right {
                display: flex;
                gap: 0.5rem;
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
            width: 100%;
            overflow-x: auto;
            -ms-overflow-style: none; /* IE and Edge */
            scrollbar-width: none; /* Firefox */

            &::-webkit-scrollbar {
                display: none; /*Chrome, Safari and Opera */
            }
        }
        
        .empty{
            color: gray;
            font-style: italic;
            white-space: nowrap;
        }

        table {
            margin-top: 1rem;

            font-size: 0.9rem;

            @media screen and (max-width: 600px) {
                font-size: 0.8rem;
            }
        }

        tr {
            width: 100%;
            --row-bg: hsl(0, 0%, 10%);

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
                background-color: hsl(0, 0%, 30%);

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
                padding: 0.3rem;
                white-space: nowrap;
                outline: 1px solid hsl(0, 0%, 0%);

                &.name {
                    position: sticky;
                    left: 0;
                    z-index: 1;
                    font-weight: 500;

                    &.clickable {
                        cursor: pointer;
                        &:hover {
                            outline: 1.5px solid white;
                            color: white;
                            text-decoration: underline;
                        }
                    }
                }

                &.truncate {
                    max-width: 10ch;
                    overflow: hidden;
                    text-overflow: ellipsis;
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

                &.noPadding {
                    padding: 0;
                }

                &:has(button.revokePro) {
                    padding-inline: 0.3rem;
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
    `;b([A()],g.prototype,"users",2);b([A()],g.prototype,"shotlists",2);b([A()],g.prototype,"templates",2);b([A()],g.prototype,"userActivity",2);b([A()],g.prototype,"changes",2);b([A()],g.prototype,"discard",2);b([A()],g.prototype,"userFilter",2);g=b([q("app-dashboard")],g);
