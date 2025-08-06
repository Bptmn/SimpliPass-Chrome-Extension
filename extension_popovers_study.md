Fonctionnalités web de l’extension Chrome :
analyse et plan de développement
Fonctionnalités offertes par les principales extensions de
gestionnaires de mots de passe
Les grands gestionnaires de mots de passe (Dashlane, Proton Pass, 1Password, LastPass, Bitwarden,
etc.) proposent des fonctionnalités spécifiques aux extensions de navigateur qui améliorent l’expérience
de remplissage et de sauvegarde des identifiants. Parmi les fonctionnalités web clés, on retrouve
notamment :
•
Autocomplétion des identifiants (Autofill) – L’extension détecte les champs de connexion
(login/mot de passe) sur une page et propose de les remplir automatiquement avec les
identifiants enregistrés pour ce site. Par exemple, Dashlane affiche une icône « D » dans les
champs de login : verte si des identifiants existent, grise sinon 1
. Cliquer sur l’icône ou le
champ fait apparaître une liste de comptes sauvegardés pour ce domaine, permettant à
l’utilisateur de choisir le bon identifiant à remplir 1
. De même, 1Password et LastPass insèrent
une petite icône dans le champ, sur laquelle on peut cliquer pour voir les identifiants disponibles
2
. Ces menus inline permettent aussi de rechercher parmi plusieurs comptes si nécessaire
3
. Certains gestionnaires offrent même une connexion automatique en une étape une fois
les champs remplis, déclenchant la soumission du formulaire automatiquement.
•
Remplissage des formulaires personnels et paiements – Au-delà des logins, les extensions
savent aussi remplir les formulaires d’adresse, de contact ou de paiement enregistrés. Par
exemple, Dashlane peut remplir automatiquement votre nom, adresse, téléphone dans les
formulaires web, ou encore vos numéros de carte bancaire 4 5
. Cette fonctionnalité est
généralement accessible via le même mécanisme d’autofill (icône dans les champs ou menu
contextuel) et facilite les inscriptions ou achats en ligne. (Cette partie pourra être implémentée
dans une phase ultérieure, car vous avez indiqué vouloir d’abord vous concentrer sur les
identifiants.)
•
Génération de mots de passe et remplissage lors des inscriptions – Les extensions proposent
un générateur de mot de passe fort lors de la création ou la modification d’un mot de passe.
Typiquement, en focusant un champ « Nouveau mot de passe », l’extension suggère un mot de
passe aléatoire robuste via son icône inline. Par exemple, 1Password affiche l’option Utiliser le
mot de passe suggéré depuis l’icône dans le champ 6
. Si l’utilisateur accepte, le mot de passe est
inséré et l’extension pourra l’enregistrer dans le coffre. Il est aussi possible d’ouvrir la popup de
l’extension pour configurer manuellement un mot de passe généré (longueur, caractères, etc.) et
7
le remplir .
•
Enregistrement automatique des nouveaux identifiants – Lorsqu’un utilisateur crée un
compte ou se connecte sur un site pour lequel le coffre ne contient pas encore de login,
l’extension détecte la soumission du formulaire et propose d’enregistrer le nouvel identifiant.
Cette proposition prend souvent la forme d’une petite fenêtre contextuelle ou d’une barre en
haut de la page. Par exemple, 1Password affiche un bandeau « Enregistrer dans 1Password »
1
après qu’on a saisi des identifiants non sauvegardés, permettant de confirmer l’enregistrement
et de choisir le dossier/vault 8
. Bitwarden possède un « Notification Bar » similaire déclenché
par son content script notificationBar.js lorsqu’il détecte une soumission de formulaire
contenant de nouveaux identifiants 9
. L’utilisateur peut alors confirmer l’ajout.
•
Mise à jour des identifiants existants – De la même façon, si l’utilisateur change son mot de
passe sur un site (formulaire de changement de mot de passe), l’extension le détecte et offre de
mettre à jour le mot de passe déjà enregistré dans le vault. Dashlane, par exemple, affiche un
pop-up après un changement de mot de passe en demandant s’il faut mettre à jour le login
existant ou créer une nouvelle entrée 10
. Cela évite d’avoir des informations obsolètes et
garantit que le coffre contient le dernier mot de passe. L’extension peut ensuite rediriger
10
l’utilisateur vers son interface (vault) pour éditer plus de détails si nécessaire .
•
Menu contextuel et fonctions de copie – Les extensions ajoutent généralement des options
dans le menu clic-droit du navigateur pour faciliter le remplissage ou la copie des données. Par
exemple, Dashlane permet via un clic-droit de Rechercher et remplir ou copier le nom d’utilisateur,
mot de passe, etc., dans n’importe quel champ 11
. De plus, Dashlane intègre un système de
« copy-paste pop-up » : si l’autofill automatique ne fonctionne pas sur un site, l’utilisateur peut
copier manuellement un champ via la popup de l’extension, ce qui déclenche l’apparition d’une
mini-fenêtre sur la page contenant les autres infos du compte (pour copier le mot de passe
correspondant, le code 2FA, etc.) 12
. Ce sont des alternatives utiles lorsque l’injection directe
échoue ou sur les navigateurs avec des restrictions (Safari par ex.).
•
Verrouillage et déverrouillage de l’extension – Bien qu’invisible dans la page web elle-même,
un aspect important est la nécessité de déverrouiller le coffre-fort dans l’extension (par mot de
passe maître, empreinte biométrique, etc.) pour accéder aux fonctions ci-dessus. Par sécurité,
les extensions se verrouillent après un certain temps d’inactivité. Par exemple, Dashlane exige la
saisie du mot de passe maître avant d’autofill des informations sensibles (notamment les
paiements), sauf si une authentification récente (moins de 5 minutes) a déjà eu lieu 13
. De
même, Bitwarden ou LastPass peuvent demander le mot de passe maître si la session est
expirée avant d’autoflouter quoi que ce soit. Cette gestion d’état (verrouillé/déverrouillé) est au
cœur de l’interaction entre l’UI principale de l’extension (popup) et les scripts de remplissage.
•
Autres fonctionnalités – D’autres raffinements existent selon les gestionnaires : par exemple
l’autofill des codes 2FA (Dashlane peut générer et autofill des codes TOTP si stockés avec le login
14
), la prise en charge des identifiants SSO (1Password permet de sauvegarder « se connecter
via Google/Facebook » et de le proposer 15
), ou encore des alertes de sécurité (détection de
page de phishing, suggestion de changer un mot de passe faible, etc.). Ces éléments sont plus
avancés et pourront être envisagés plus tard. Pour la phase 1, vous vous concentrez sur les
identifiants classiques (couple login/mot de passe).
En résumé, toutes ces extensions visent à simplifier la connexion pour l’utilisateur : remplissage en un
clic, suggestions pertinentes, ainsi qu’à capturer automatiquement les données pour tenir le coffre à
jour, le tout en garantissant la sécurité (nous détaillerons les aspects sécurité plus loin).
2
Logique de fonctionnement en coulisse de ces fonctionnalités
Malgré leur apparente simplicité côté utilisateur, ces fonctionnalités d’autofill reposent sur une
architecture bien définie entre les composants de l’extension. Voici comment elles fonctionnent
généralement sous le capot :
•
Détection des formulaires côté page (Content Script) : Les extensions injectent un script de
contenu dans les pages web visitées. Ce content script s’exécute dans un contexte isolé du site,
mais peut accéder au DOM de la page. Son rôle est d’identifier les champs pertinents (par ex.
champs <input> de type email/username et password dans un formulaire de login) et de
notifier l’extension qu’il y a une possibilité d’autocomplir. Le content script analyse le HTML à la
recherche d’indices (attributs type, noms courants des champs, etc.). Par exemple, Bitwarden
utilise une classe CollectAutofillContentService pour parcourir le DOM et rassembler
les « détails de page » (Page Details) comprenant la liste des champs à remplir et leur contexte
16
. Cette étape se fait à chaque chargement de page ou changement significatif (navigation
AJAX, etc.) afin d’avoir la liste à jour des formulaires détectés.
•
Correspondance avec le coffre utilisateur : Une fois les champs détectés, l’extension doit
déterminer si l’utilisateur a des identifiants correspondant au site. En général, le content script
envoie au background de l’extension une requête avec les informations du site (URL/domain) et
éventuellement le nom des champs détectés. Le script d’arrière-plan (background) est le cerveau
de l’extension (sous MV3 c’est souvent un Service Worker qui s’active en tâche de fond). Le
background, ayant accès aux données utilisateur (coffre-fort déchiffré en mémoire, ou accessible
via un store global), va rechercher les entrées dont le domaine correspond au site en cours. La
correspondance de domaine peut être stricte ou au niveau du domaine de base selon les
réglages (ex : company.com peut correspondre à sub.company.com si on choisit la
correspondance sur le domaine de base 17
). Lorsque le background trouve des identifiants
enregistrés pour le site courant, il les renvoie au content script ou prépare une réponse pour
l’UI.
•
Affichage des suggestions et remplissage : Le content script, après avoir reçu du background
la liste des comptes correspondants, va afficher à l’utilisateur l’interface de suggestion
directement sur la page. Deux approches existent : injecter du HTML/CSS dans la page pour
faire apparaître un menu déroulant sous les champs, ou insérer un élément plus isolé comme
une iframe ou un Shadow DOM. Bitwarden, par exemple, implémente un menu inline
sophistiqué en injectant un composant web avec Shadow DOM fermé contenant une iframe de
l’extension pour la liste 18 19
. Cette technique garantit que le site web ne peut pas altérer le
contenu du menu (voir section Sécurité). Pour une première version plus simple, vous pouvez
opter pour une injection directe d’un petit <div> stylé apparaissant sous le champ actif avec
les options de remplissage (en veillant à isoler un minimum le style). Lorsque l’utilisateur
sélectionne un identifiant dans la liste (ou appuie sur la touche de raccourci), le content script
insère les valeurs dans les champs DOM correspondants (via element.value = ... et
éventuellement déclenche les événements appropriés). Si l’extension supporte l’auto-submit, le
content script peut ensuite appeler form.submit() ou simuler un appui sur Entrée pour
envoyer le formulaire.
•
Partage des données utilisateur entre popup et content script : L’extension a typiquement
une popup principale (lorsqu’on clique sur l’icône dans la barre du navigateur) qui permet de
parcourir le coffre, d’effectuer la recherche, etc., et les content scripts qui agissent sur les pages.
Ces deux composantes doivent accéder aux mêmes données utilisateur (logins, état de
3
•
•
•
verrouillage…). Pour cela, les données du coffre sont souvent maintenues dans le background
(ou un module commun) et partagées via un mécanisme de messages. Par exemple, dans
Bitwarden, le content script envoie des messages via chrome.runtime.sendMessage au
background, qui écoute avec chrome.runtime.onMessage.addListener et répond en
conséquence 20 21
. Inversement, le background peut pousser des messages vers un content
script via chrome.tabs.sendMessage 22
. Dans votre cas, comme vous utilisez Zustand pour
stocker l’état (listes de credentials, état d’auth, etc.), on veillera à intégrer ces messages au
store existant. Concrètement, le background pourrait appeler votre store Zustand (par ex.
useCredentialsStore.getState().credentials ) pour obtenir les identifiants une fois le
vault déverrouillé, et n’envoyer au content script que les entrées pertinentes. Ainsi, le content
script n’a pas besoin de connaître la logique interne de stockage : il se contente de demander
« donne-moi les logins pour site X » et attend la réponse.
Détection de la soumission de formulaire pour capture : Le content script ne sert pas qu’à
remplir, il surveille aussi quand l’utilisateur soumet un formulaire de login manuellement.
Typiquement, on peut écouter les événements submit sur les formulaires ou input /
change sur les champs mot de passe pour repérer un nouveau couple login/mot de passe.
Bitwarden utilise à cet effet un script de contenu dédié (notificationBar) qui détecte qu’un
formulaire a été envoyé ou que l’URL a changé après un login, indiquant possiblement une
connexion réussie 23
. Une fois détecté, le content script envoie un message au background du
type « nouveau login capturé » en incluant le domaine et les valeurs d’identifiant/mot de passe.
Le background pourra alors déterminer si ces identifiants existent déjà ou non dans le vault, puis
instruire l’UI d’afficher la fenêtre de sauvegarde. Dans certains cas, le content script peut
injecter directement une bannière HTML dans la page pour proposer « Enregistrer ce mot de
passe ? », ce qui est l’approche de LastPass ou 1Password par exemple. Ou bien l’extension peut
ouvrir une petite popup au premier plan (via une extension page) demandant confirmation.
L’implémentation dépend de l’ergonomie souhaitée, mais l’essentiel est que la logique suive ce
flux : content script capture → background décide → UI de proposition à l’utilisateur →
enregistrement effectif via background.
Mise à jour du vault local et distant : Si l’utilisateur accepte d’enregistrer un nouvel identifiant
(ou de mettre à jour un existant), le background orchestrera l’opération de stockage. Étant donné
votre architecture, cela signifie chiffrer le mot de passe avec la clef utilisateur, stocker l’entrée
mise à jour soit dans secureLocalStorage (votre vault chiffré en local, possiblement via
chrome.storage.local d’après votre code 24 25
) et l’ajouter à la base de données distante
(Firestore via votre API) si nécessaire. Grâce à vos services existants (couche Service dans votre
architecture trois couches), vous pourrez appeler par exemple addCredential ou
updateCredential qui gère l’ajout dans Firestore puis met à jour le store Zustand via vos
actions (ex: useCredentialsStore.getState().addCredential(...) pour mettre à jour
l’état local). Votre fonction de sync ( syncAllStates ) montre comment mettre à jour les stores
en cas de nouvelles données 26 27
. En somme, l’extension doit garder synchronisé le coffre
entre le background (source de vérité sécurisée) et l’UI (popup, et maintenant content scripts) en
temps réel.
Gestion des états et interactions : Tout au long de ces flux, il faut tenir compte de l’état de
l’extension (utilisateur connecté ou non, vault déverrouillé ou verrouillé). Par exemple, si le
content script détecte un formulaire mais que le coffre est verrouillé, il peut soit ne rien
proposer, soit inciter l’utilisateur à se connecter (souvent en affichant l’icône mais nécessitant un
clic qui déclenche l’ouverture de la popup de login). Une bonne logique est d’éviter d’envoyer les
données sensibles tant que l’utilisateur n’a pas déverrouillé. Vous avez un AuthStore dans
4
Zustand pour l’état d’authentification 28
– le background peut consulter isAuthenticated
avant de répondre aux demandes d’autofill. S’il n’est pas auth, il peut soit répondre avec
« verrouillé » (ce qui peut faire afficher un message type “Veuillez déverrouiller votre coffre pour
remplir”) ou directement déclencher l’ouverture de la fenêtre de login de l’extension.
En résumé, ces fonctionnalités reposent sur une collaboration étroite entre le content script et le
background de l’extension, le premier servant d’yeux et de mains sur la page web (détecter et remplir),
le second d’esprit central qui décide quoi remplir en se basant sur le coffre-fort de l’utilisateur 20
. La
popup (UI principale) et le content script partagent quant à eux les données via ce background
commun. Cette séparation des responsabilités assure une structure maintenable et sécurisée, que nous
détaillons dans la section suivante.
Structure typique de l’extension : content scripts, background et
popup
Dans une extension Chrome moderne (Manifest V3), on distingue plusieurs types de scripts/fichiers qui
ont chacun un rôle clair :
•
Le script d’arrière-plan (background/service worker) : C’est un script défini dans le manifest
(champ background ). Sous MV3, il s’agit généralement d’un service worker qui n’est activé
qu’en cas d’événements (messages, clic sur l’icône, etc.), bien qu’il puisse rester vivant tant qu’il
gère des messages en cours. Le background est le pivot central de l’extension. Il a accès à la
plupart des API Chrome (stockage, notifications, contextMenus, etc.) et il est le seul à pouvoir
faire certaines actions sensibles. Dans votre projet, on voit un dossier background/ prévu
dans l’architecture 29
, ce sera l’endroit où implémenter la logique d’écoute des messages et de
prise de décision. Concrètement, le background va : écouter les requêtes des content scripts (via
chrome.runtime.onMessage ), écouter les interactions utilisateur globales (par ex. clic sur
l’icône de l’extension, raccourcis clavier globaux définis dans manifest/commands, événements
de context menu). À chaque événement, il exécute la routine appropriée – par ex.,
runtime.background.ts chez Bitwarden gère les requêtes de base,
notification.background.ts gère celles liées à la barre de sauvegarde 30
. Vous pouvez
imiter cette séparation ou tout centraliser dans un seul module selon la taille du code.
•
Les scripts de contenu (content scripts) : Ce sont des scripts listés dans le manifest (champ
content_scripts ) avec des filtres de pages sur lesquelles ils doivent s’injecter (généralement
toutes les pages http/https). Ils s’exécutent dans le contexte des pages web mais dans une
sandbox JS distincte (pas le même contexte d’exécution que les scripts natifs du site, même s’ils
partagent le DOM). Leur rôle, comme décrit plus haut, est d’interagir avec la page : détecter les
formulaires, insérer l’UI d’autofill inline, écouter les soumissions. Ils doivent rester relativement
légers et déléguer au background toute décision ou accès aux données sensibles. Dans votre
projet, le dossier content/ contiendra ces scripts 29
. On peut avoir plusieurs scripts selon la
fonctionnalité (Bitwarden en a un pour initier autofill, un pour l’overlay menu, un pour la
notification de sauvegarde, etc. 31
). Pour démarrer, vous pouvez n’en créer qu’un seul (par ex.
content_script.js ) qui englobe détection + remplissage + capture, puis éventuellement le
scinder si cela devient complexe.
•
La popup de l’extension (UI) : Il s’agit de la page HTML/JS/CSS définie comme
action.default_popup dans le manifest. C’est l’interface que l’on obtient en cliquant sur
l’icône de l’extension à côté de la barre d’adresse. Souvent développée en React ou autre, c’est
une page web à part entière qui a accès (via scripts) aux APIs d’extension, mais pas directement
5
au contexte des pages web. Elle sert à afficher le coffre (liste de mots de passe), permettre la
recherche, les ajouts manuels, les réglages, etc. Dans votre application, cette popup est déjà en
place (probablement l’app React qui utilise Zustand pour afficher les credentials). Elle interagit
avec le background soit via chrome.runtime.sendMessage (par ex. pour demander la liste
des items à afficher si le background les stocke), soit via des appels direct à chrome.storage /
Zustand partagés selon votre implémentation. Étant donné que vous avez une architecture trois
couches commune, vos services peuvent être appelés aussi bien depuis la popup que depuis
l’extension : par exemple un service “getCredentials” peut être utilisé au chargement de la popup
pour remplir le store Zustand, et réutilisé par le background quand un content script a besoin de
credentials. Il faut donc bien définir qui détient la source de vérité. Une approche courante est
de faire charger le vault chiffré depuis le stockage local dans le background au démarrage de
l’extension, de le déchiffrer quand l’utilisateur se logue (via la popup), puis de garder en mémoire
la liste des credentials déchiffrés dans le background (ou dans un store global accessible). La
popup peut alors soit requêter le background pour obtenir la liste (ex: via un message ou via une
architecture type Redux persistant), soit partager le store Zustand en utilisant la même instance
dans background et popup (ce qui est délicat en extension car contexte différents, plus simple
de passer par messages). Dans tous les cas, la popup et le content script ne doivent pas
dupliquer la logique de déchiffrement ou d’accès réseau, ils doivent solliciter le background
ou les services communs.
•
Autres composants : On peut mentionner également la page d’options (pour configurer
l’extension, rarement nécessaire pour un password manager car tout se fait dans la popup ou
web app) ou encore des pages spécifiques pour certaines fonctionnalités (Bitwarden par ex.
utilise des pages invisibles chargées dans des iframes pour le menu overlay 19
). Dans votre cas
d’usage initial (autofill logins), vous n’aurez pas forcément besoin de pages supplémentaires. Un
autre élément technique important est le fichier manifest.json , qui liste les permissions (ex:
<all_urls> pour autoriser l’injection du content script sur toutes les pages http/https,
permission storage pour utiliser chrome.storage, etc.), les scripts de contenu et leurs cibles,
le background script, etc. Veillez à configurer ce manifest correctement en fonction des besoins
(principe de moindre privilège : n’ajoutez pas de permissions inutiles). Par exemple, pour
l’autofill, vous n’avez pas besoin d’accéder aux URL spécifiques en dehors des content scripts
injectés, donc les permissions de base suffisent. Évitez les permissions host trop larges si
possible, mais ici il est courant de mettre "matches": ["https://*/*", "http://*/*"]
pour couvrir tous les sites web.
Communication entre ces composants : Le schéma d’appel typique sera : Content Script ↔ Background
↔ Popup. Par exemple, si dans la popup l’utilisateur clique sur “remplir maintenant” pour un site, la
popup peut envoyer un message au background du genre « fillLogin {domain: X, credentialsId: Y} », le
background relaie au content script actif sur l’onglet (via tabs.sendMessage ) pour qu’il exécute
réellement le remplissage 22
. Inversement, un content script détecte un formulaire soumis : il envoie
runtime.sendMessage au background, qui éventuellement déclenchera l’affichage d’une UI de
sauvegarde (soit via content script injection d’une barre, soit en ordonnant à la popup de s’ouvrir avec
un écran de confirmation). Ces échanges sont sécurisés par l’isolation de l’extension (un site web
normal ne peut pas écouter ces messages, seuls les scripts de l’extension y ont accès). Il est
recommandé d’établir un protocole clair de messages (avec un champ command par exemple,
comme fait Bitwarden 32
) pour traiter chaque cas.
Enfin, au sein de votre codebase, vous avez déjà une structure multi-plateforme. L’adapter Extension
que vous avez prévu joue le rôle de couche d’abstraction pour les opérations spécifiques Chrome
33
(stockage local, etc.) . Vous l’utiliserez dans vos services pour que, par exemple,
6
33
storeUserSecretKeyEncrypted utilise chrome.storage.local.set côté extension . Vos
stores Zustand ( AuthStore , CredentialsStore , etc. 28 34
) seront principalement manipulés
dans la popup (React), mais le background pourrait appeler les mêmes actions si vous partagez le store
(attention, par défaut un store Zustand dans la popup n’est pas accessible depuis le background, il
faudrait éventuellement du messaging pour synchroniser – à moins d’utiliser une solution type Zustand
persistant + chrome.storage comme intermédiaire). Une alternative est de faire du background le
maître de l’état et de faire que la popup interroge le background (via messages ou via une copie de
l’état). Par simplicité, vous pouvez initialement charger les données dans background ET dans la popup
de façon parallèle (par ex., après login réussi, vous appelez vos services pour récupérer tous les
credentials : le background les stocke en variable locale + la popup via Zustand). Ensuite, assurez-vous
que les modifications (ajout d’un identifiant via capture, etc.) mettent à jour les deux. Le pseudo-code
pourrait être : background reçoit nouveauCredential -> appelle
useCredentialsStore.getState().addCredential (si accessible) et envoie un message à la
popup pour qu’elle rafraîchisse sa liste ou synchronise. Votre fonction de synchronisation
syncAllStates 26
peut aider à appliquer un état global à plusieurs stores en cas de besoin.
En résumé, la meilleure pratique est de maintenir une séparation nette : content scripts pour l’UI
intégrée aux pages et la détection, background pour la logique, popup pour l’UI du coffre. Cette
modularité augmente la sécurité et la clarté du code 35
. Dans la section suivante, on examine
justement les considérations de sécurité propres à ces fonctionnalités d’autofill.
Gestion de la sécurité pour l’autofill et la sauvegarde
La sécurité est primordiale pour une extension de gestionnaire de mots de passe, étant donné la
sensibilité des données manipulées. Voici comment les produits existants et les bonnes pratiques
traitent les risques spécifiques aux fonctionnalités web :
•
Chiffrement et zéro connaissance : À la base, tous les gestionnaires sérieux (y compris le vôtre)
adoptent une architecture zero-knowledge. Cela signifie que les données du vault sont
chiffrées localement avec une clé dérivée du mot de passe maître de l’utilisateur, et ni l’éditeur
ni l’extension ne peuvent voir les données en clair sans que l’utilisateur ait saisi son mot de
passe. Dashlane par exemple insiste que, même dans sa nouvelle extension web-first, toutes les
données restent chiffrées en AES-256 localement et qu’un attaquant compromettant leurs
serveurs n’obtiendrait que des blob chiffrés impossibles à déchiffrer sans la clé utilisateur
36
37
. Concrètement, dans votre application, cela se traduit par l’utilisation de crypto (PBKDF2,
AES) dans votre couche Libraries pour chiffrer le vault et stocker une version sécurisée dans
chrome.storage (cf. vos fonctions encryptForStorage / decryptFromStorage dans
l’adapter extension 38
). Aucune donnée en clair ne doit être écrite sur le disque – elle ne vit
qu’en mémoire (store Zustand) une fois le coffre déverrouillé. Pensez à effacer de la mémoire
les données sensibles dès que possible (par ex. nettoyer les variables locales, et bien gérer le
lock pour purger le store en mémoire). Votre architecture mentionne un Platform Security et
Storage Encryption layer 39
– dans le contexte extension, le Keychain n’existe pas, mais on peut
compter sur le stockage chiffré et la communication en TLS avec le backend.
•
Isolement du contenu injecté : Lorsque l’extension insère des éléments dans la page (icône,
menu de suggestions, etc.), il faut éviter que le site web puisse interférer (pour voler des infos ou
modifier le comportement). La solution adoptée par certains est d’utiliser un Shadow DOM
fermé ou des iframes sandboxées. Bitwarden, par exemple, crée un Shadow DOM isolé et y
insère une <iframe src="extension-page.html"> pour afficher la liste des identifiants
19
. Cette iframe est servie par l’extension elle-même (donc domaine chrome-extension://
7
•
•
•
<id> ), ce qui la rend inaccessible au script de la page (la page ne peut ni lire son contenu ni le
modifier, et le CSS du site ne peut pas non plus la styliser). C’est un niveau d’isolation très élevé,
au prix d’une complexité accrue. Pour une première version, vous pourriez ne pas aller jusque-là,
mais gardez en tête de minimiser les informations que le content script place directement
dans le DOM. Par exemple, évitez de mettre le mot de passe en clair dans un attribut data-* ou
du texte visible inutilement. Insérez-le seulement dans le champ cible au dernier moment. Si
vous faites un menu déroulant HTML, assurez-vous que les entrées affichées (typiquement les
noms d’identifiants ou adresses mail) ne révèlent pas trop d’information sensible à une page
potentiellement malveillante. (Un site compromis pourrait, théoriquement, détecter qu’un menu
Dashlane/LastPass est présent et essayer de le manipuler, mais avec l’isolation actuelle des
content scripts ce risque est faible, surtout en Shadow DOM.)
Limitation de l’autofill automatique : Une leçon importante des récents audits concerne
l’autofill non sollicité dans des contextes dangereux. En particulier, le cas des iframes externes et
des sous-domaines piégés a fait l’objet de vulnérabilités. Bitwarden a été épinglé car son
extension, si l’option Autofill on page load est activée, pouvait remplir des formulaires dans des
iframes incluses sur une page de confiance, même si ces iframes pointaient vers un domaine
tiers malveillant 40
. Un attaquant pouvait ainsi intégrer une iframe cachée vers un faux
formulaire et capturer les identifiants remplis automatiquement 41
. De plus, Bitwarden
considérait par défaut qu’un sous-domaine correspond au même site (ex: un identifiant
enregistré pour company.tld sera autofill sur malicious.company.tld ) – ce qui n’est pas
toujours sûr si des sous-domaines sont contrôlés par d’autres utilisateurs 17
. Solution : La
plupart des gestionnaires ont durci leur politique. Proton Pass, par exemple, désactive l’autofill
dans les iframes cross-domaine 42
. Bitwarden, suite aux retours, a ajouté des restrictions :
l’iframe n’est autofill que si elle pointe vers le même domaine que la page parente (ou un
domaine de confiance explicitement autorisé par l’utilisateur) 43
. Pour votre extension,
n’autocomplétez jamais dans une iframe d’un domaine différent sans action explicite de
l’utilisateur. Vous pouvez détecter cela via le content script (en comparant
window.location.host du top frame vs de l’iframe où le script s’exécute). En pratique, un
content script s’exécute par frame, donc restreignez la fonctionnalité aux frames top-level ou
frames dont le domaine correspond exactement. Idem pour les sous-domaines : par défaut,
exigez une correspondance sur le domaine de base (eTLD+1) et peut-être l’option de l’utilisateur
s’il souhaite étendre aux subdomains. En suivant ces règles, vous évitez les attaques de phishing
caché dans un composant tiers.
Demande de confirmation avant remplissage critique : Certaines extensions choisissent de
ne pas autofill automatiquement les identifiants dès le chargement de la page, justement par
prudence (c’est le cas de Bitwarden dont l’autofill automatique est opt-in et accompagné d’un
avertissement 44 45
). LastPass remplissait automatiquement par défaut, ce qui est confortable
mais potentiellement risqué. Une bonne pratique est de nécessiter une action utilisateur pour
le remplissage, par exemple un clic dans le champ ou un raccourci clavier, plutôt qu’un autofill
silencieux au chargement. Cela laisse le temps à l’utilisateur de vérifier qu’il est bien sur le bon
site et évite le vol furtif. Vous pouvez implémenter un réglage « Autofill à la navigation »,
désactivé par défaut, ou bien toujours requérir le clic sur l’icône dans le champ pour remplir.
Protection du mot de passe maître et d’accès : Votre extension devrait verrouiller
automatiquement après une certaine durée ou lorsque le navigateur est fermé, etc. Ainsi, même
si quelqu’un trouve un PC allumé, il ne pourra pas utiliser l’autofill sans connaître le MP. Dashlane
demande systématiquement le Master Password avant de remplir des données très sensibles
(paiements) ou après un délai de 5 minutes d’inactivité 5
. Vous pouvez adopter un mécanisme
similaire via votre store Auth (une timestamp du dernier unlock, et le content script/background
8
refuse de donner les credentials si l’intervalle > X minutes, à moins que l’utilisateur ne se
réauthentifie).
•
Permissions minimales et domaine autorisé : Dans le manifest, ne demandez que les
permissions nécessaires. Par exemple, évitez d’inclure <all_urls> dans
externally_connectable (paramètre permettant à des pages web externes de
communiquer avec votre extension) sauf si requis. Proton Pass avait initialement autorisé son
domaine account.proton.me pour lier l’extension à la webapp Proton, ce qui est normal,
mais il faut éviter tout wildcard là-dedans 46
. De même, si vous n’avez pas besoin de content
scripts sur les pages internes Chrome ou fichiers locaux, ne les incluez pas dans les matches.
Chaque permission en plus est un risque potentiel en cas de faille.
•
Validation des messages et origine : Quand vous implémentez la communication interne,
assurez-vous de vérifier ce qui est reçu. Par exemple, si un content script envoie un message
« giveCredentials for domain X », assurez-vous côté background que X correspond bien à l’onglet
expéditeur (on peut obtenir l’ sender.url dans onMessage). Cela évite qu’un content script
malveillant (dans le cas improbable où un site réussit à injecter du script dans le contexte d’un de
vos content scripts isolés, ce qui ne devrait pas arriver si l’isolation est correcte) puisse demander
des creds pour un domaine différent. C’est une précaution supplémentaire.
•
Audit et transparence : Proton Pass étant open-source, ils ont subi un audit Cure53 qui a
identifié des points (ex: la mémoire du process extension n’était pas vidée après verrouillage, ce
qui a été corrigé en fermant l’extension après lock pour libérer la RAM 47
). Vous pourriez vous
inspirer de leurs conclusions pour vérifier votre implémentation. Par exemple, lorsqu’on
verrouille le coffre, pensez à nettoyer toute donnée sensible en mémoire (objets JavaScript stockant
des mots de passe en clair, etc.). Heureusement, en JS, on ne contrôle pas exactement le garbage
collector, mais on peut dereferencer les objets (ex: credentialsList = [] ) pour aider.
En somme, la sécurité de ces features repose sur : le chiffrement de bout en bout, l’isolement du
contexte d’exécution (content scripts protégés du JS des sites), des garde-fous contre les contextes
piégés (iframes, phishing domain), et la limitation de l’accès sans interaction ni re-authentification.
En appliquant ces principes, on peut garantir que l’autofill est pratique sans devenir une faille. Reste
maintenant à intégrer tout cela dans un plan de développement concret.
Plan de développement par étapes pour ajouter ces
fonctionnalités (Phase 1 : Credentials)
Développons un plan structuré pour implémenter, pas à pas, l’autofill des identifiants et la sauvegarde
automatique, en veillant à s’appuyer sur votre logique existante (Zustand, secureLocalStorage, base de
données) et à respecter les bonnes pratiques de code, de simplicité et de sécurité :
1. Préparer le terrain dans l’extension (manifest & structure) : Commencez par configurer votre
manifest.json pour déclarer le content script et les permissions requises. Par exemple, ajoutez une
entrée dans "content_scripts" avec "matches": ["https://*/*", "http://*/*"] (pour
cibler toutes les pages web) et le fichier JS à injecter (ex: dist/contentScript.js ). Assurez-vous
d’avoir la permission "storage" (pour chrome.storage) et éventuellement "activeTab" si vous
comptez utiliser certaines APIs sur l’onglet actif. Déclarez aussi un "background" service worker (ex:
background.js ). Créez l’ébauche de ces fichiers : un background.js qui contient un listener de
messages ( chrome.runtime.onMessage.addListener ) prêt à gérer vos commandes, et un
9
contentScript.js qui pour l’instant fait quelque chose de simple (ex: log "content script loaded"). Vérifiez
que l’injection fonctionne en chargeant l’extension en mode développeur sur Chrome. Cette étape
consiste à mettre en place l’infrastructure sans encore la logique métier.
2. Détection des champs de connexion dans le content script : Implémentez dans le content script la
logique pour identifier sur la page les formulaires de login. Concrètement, recherchez les <input> de
type « password », puis voyez s’ils ont un champ texte (input[type=text] ou email) associé (par voisinage
dans le DOM ou en parcourant les formulaires). Vous pouvez parcourir document.forms et pour
chaque form, chercher un input type=password. Une fois un couple (loginInput, passwordInput)
identifié, conservez leurs références. À ce stade, injectez aussi visuellement un petit indicateur dans le
champ pour signaler la présence du content script – par exemple, ajouter une icône bouton à droite du
champ. Vous pourriez insérer un petit élément <button> positionné en absolu dans le champ (via
CSS) ou utiliser ::after en CSS si plus simple. Le but est d’avoir un point d’ancrage pour l’utilisateur.
N’appliquez ceci que si vous détectez un champ de login, et idéalement marquez-le d’un attribut (ex:
data-simplipass="true" ) pour éviter de dupliquer l’injection si le script est exécuté de nouveau. À
cette étape, on ne remplit rien automatiquement, on prépare juste l’UI.
3. Communication Content Script → Background (demande de credentials) : Programmez le
comportement au clic sur l’icône injectée (ou sur le champ focus, selon votre design). Lorsqu’un
utilisateur interagit pour vouloir autofill (ex: il clique l’icône ou appuie sur un raccourci que vous
définissez, comme Alt+P ), le content script devrait envoyer un message au background pour obtenir
les identifiants correspondants. Utilisez chrome.runtime.sendMessage avec un objet du type
{ cmd: 'getCredentials', url: location.hostname } par exemple. Dans le background,
implémentez le handler pour 'getCredentials' : il va recevoir request.url. Important :
déterminez la stratégie de correspondance de domaine ici. Peut-être utilisez-vous déjà une fonction
utilitaire (dans Services ou Libraries) pour comparer une URL avec les URLs stockées de chaque
credential. Servez-vous-en pour filtrer vos credentials (depuis le vault déchiffré). Puis, renvoyez la liste
correspondante via sendResponse ou en utilisant la promesse (les messages peuvent renvoyer une
promesse sous MV3). Par exemple, le background peut répondre { accounts: [...] } contenant
une liste limitée d’infos (nom d’utilisateur, éventuellement un identifiant unique pour que le content
script puisse ensuite demander le mot de passe de celui choisi). Sécurité : assurez-vous que si le vault
n’est pas déverrouillé (ex: pas de userSecretKey en mémoire), le background au lieu de renvoyer les
comptes renvoie un état « locked ». Le content script devra alors peut-être afficher un message du
genre « Veuillez déverrouiller SimpliPass pour remplir » et éventuellement ouvrir la popup (vous pouvez
utiliser chrome.runtime.openOptionsPage() ou envoyer un message au background pour qu’il
ouvre la popup via chrome.action.openPopup() ).
4. Récupération des données depuis votre vault (background) : Lors de la réception de
getCredentials , le background va accéder aux données de l’utilisateur. C’est ici qu’on intègre
Zustand et secureLocalStorage. Vous avez probablement, après le login initial de l’utilisateur, déchiffré
tous les items et rempli useCredentialsStore avec la liste des credentials. Le background pourrait
accéder à ce store s’il partage le même contexte (ce n’est pas trivial car background ≠ popup, mais vous
pourriez avoir initialisé Zustand dans a common module accessible aux deux). Sinon, l’alternative est
que la popup a déjà les données et vous les stockez aussi dans chrome.storage.session ou une
variable globale du background. Simplicité : vous pouvez stocker en variable globale du background la
liste des credentials (en mémoire) quand l’utilisateur se logue via la popup. Par exemple, lors du login,
la popup envoie au background setVaultData avec les données déchiffrées, que le background met
dans global.vault . Ainsi, quand getCredentials arrive, le background peut filtrer
global.vault . Mieux, appelez directement vos services existants : par exemple, peut-être avez-vous
une fonction getAllCredentials() qui retourne tous les identifiants (en appelant Firestore ou
10
l’IndexedDB locale). Si oui, utilisez-la, mais attention aux performances : il vaut mieux ne pas appeler le
réseau à chaque fois qu’on remplit, d’où l’intérêt du cache en mémoire. En tout cas, cette étape consiste
à brancher la requête d’autofill sur vos données. Testez ce bout en simulant un vault avec une ou
deux entrées en dur pour voir si la chaîne content->background->content fonctionne (vous pouvez faire
un console.log dans le content script pour vérifier qu’il reçoit bien les comptes à proposer).
5. Affichage du menu de suggestions sur la page : Maintenant que le content script peut obtenir une
liste d’identifiants correspondants, implémentez l’UI de suggestion. Si une seule correspondance est
trouvée, vous pouvez dans un premier temps auto-remplir directement (certains gestionnaires le font,
d’autres préfèrent quand même attendre une action – à vous de voir votre préférence UX). S’il y en a
plusieurs, affichez une liste. Vous pouvez, par simplicité, créer un élément <ul> ou <div>
positionné juste sous le champ de texte. Ajoutez-y des items cliquables (par exemple nom du compte –
idéalement, le nom d’utilisateur/email, voire le nom du site si vous le stockez). Vous pouvez obtenir le
nom d’affichage depuis vos données (souvent c’est l’username ou le titre de l’entrée). Veillez à styler ce
menu de manière évidente (fond différent, etc.) et à le retirer (remove du DOM) lorsqu’il n’est plus
nécessaire (par ex. si l’utilisateur clique ailleurs). Pour la première version, rester en plain content
script DOM est acceptable, mais souvenez-vous que plus tard, pour la robustesse, passer à un Shadow
DOM ou iframe pourrait être envisagé. Chaque item du menu, lorsqu’on le survole ou presse Entrée
dessus, devrait déclencher le remplissage.
6. Remplissage des champs : Implémentez la fonction qui, depuis le content script, prend en entrée un
identifiant (celui choisi par l’utilisateur) et remplit le formulaire. Comment obtenir le mot de passe en
clair à insérer ? Deux approches : soit vous aviez dès l’étape 3 renvoyé les mots de passe dans la liste
(peu recommandé pour sécurité – mieux vaut ne sortir le mot de passe qu’au dernier moment pour
l’entrée choisie), soit vous ne renvoyez qu’un identifiant référence (par ex. l’ID interne du credential).
L’option la plus sûre est la seconde. Donc, lorsqu’un item est choisi, le content script envoie un nouveau
message au background du type { cmd: 'getCredentialDetail', id: 'abc123' } . Le
background à son tour va retrouver dans le vault le login/mot de passe de l’entrée voulue et renvoyer le
mot de passe (et éventuellement le login, mais le login on l’a déjà via le champ ou via la liste).
Alternativement, comme le content script a déjà l’username (qu’il peut avoir mis comme label dans la
liste), il pourrait directement remplir le champ utilisateur. Donc probablement, pour remplir, il vous faut
au minimum le mot de passe. Faites attention à ne jamais logguer le mot de passe ni le transmettre à
un autre destinataire que le content script qui doit l’insérer. Lorsque le content script reçoit le mot de
passe en réponse, assignez usernameInput.value = ... et passwordInput.value = ....
Vous pouvez déclencher des événements ( input / change ) si nécessaire pour que les sites réagissent
(certains sites écoutent ces events pour activer le bouton de login). Enfin, si vous voulez simuler l’envoi,
appelez form.submit() ou faites passwordInput.form?.submit() . Dans un premier temps, il
est raisonnable de ne pas autosoumettre et de laisser l’utilisateur appuyer sur Entrée, afin d’éviter des
surprises (mais vous pouvez le rendre optionnel plus tard).
7. Gestion du formulaire soumis (capture) : Maintenant, côté content script, ajoutez un écouteur pour
surveiller la soumission manuelle du formulaire de login. Plusieurs stratégies :
form.addEventListener('submit', ...) ou surveiller un changement d’URL après un clic sur
“Login”. La plus simple est d’écouter submit sur les formulaires identifiés plus tôt. Quand l’événement
se produit, exécutez un callback qui vérifie si les champs username/password ont des valeurs et si l’on a
un login non vide. Ensuite, déterminez si c’est un candidat à l’enregistrement. Pour cela, vous pouvez
comparer l’URL du site + le username saisi contre vos données existantes (disponibles via background).
Mais rappelez-vous, à ce stade, si l’autofill a eu lieu via votre extension, c’est que le login était déjà
connu. Donc les cas intéressants sont : (a) l’utilisateur a tapé manuellement un identifiant inconnu (ou
un nouveau site), (b) l’utilisateur a modifié le mot de passe sur un site existant. Vous pouvez
implémenter la logique de décision côté background : le content script se contente d’envoyer une
11
notification du type
{ cmd: 'submittedCredentials', data: { username: X, password: Y, url:
location.hostname } } . Le background reçoit ça après la soumission (idéalement après que la
soumission ait réussi – mais comme on ne peut pas facilement savoir le résultat de la connexion côté
client, on envoie dès la soumission, puis on pourra éventuellement vérifier plus tard si le site a redirigé).
Le background checke dans le vault : y a-t-il déjà un identifiant pour location.hostname avec ce
username ? Si non, c’est un nouvel identifiant -> préparez une proposition d’enregistrement. Si oui et
que le mot de passe diffère, c’est une mise à jour -> préparez une proposition de mise à jour. S’il n’y a
pas de changement, peut-être l’utilisateur s’est juste logué normalement avec un existant, donc pas
d’action.
8. Interface de proposition d’enregistrement/mise à jour : Pour informer l’utilisateur et obtenir sa
confirmation, deux manières : via la page web ou via l’extension. a) Via la page web (content script) :
vous pouvez injecter un élément visuel discret, par ex. une barre en haut de l’écran ou un petit popup
près du formulaire, disant « Enregistrer ce mot de passe dans SimpliPass ? [Enregistrer] [Ignorer] ». C’est
le comportement de LastPass/1Password – souvent une barre en haut de la page. b) Via l’extension :
vous pouvez faire clignoter l’icône de l’extension ou ouvrir directement la popup de l’extension avec un
écran interne « Enregistrer ce login ». La méthode (a) est plus fluide pour l’utilisateur car tout se passe
sur le site, sans étape supplémentaire. Vous pouvez donc implémenter (a) via le content script : créez un
<div id="simplipass-savebar"> avec le texte et deux boutons. Stylisez-le de manière
suffisamment neutre et positionnez-le, par exemple position: fixed; top: 0; width: 100%;
background: #fffbea; border-bottom: 1px solid #d5d5d5; z-index: 9999; pour qu’il
apparaisse en haut. Les boutons Enregistrer/Annuler envoient des actions : si Annuler, simplement
retirer la barre; si Enregistrer, envoyer un message au background du genre
{ cmd: 'confirmSave', decision: 'save', data: { username, password, url } }.
(Vous pouvez inclure plus d’infos, ex : un champ pour choisir le nom de l’entrée ou le dossier – mais
pour phase 1, restez minimal.) Le background reçoit la confirmation et effectue réellement la
sauvegarde. Après enregistrement, faites disparaître la barre (ou la popup extension si c’était cette
voie). N’oubliez pas de déclencher une mise à jour du state : par ex., appelez votre service d’ajout qui
va chiffrer le password avec la clé utilisateur et l’envoyer vers Firestore (via Cloud Function ou
directement si vous avez un SDK dans l’extension), puis mettre à jour localement (Zustand). Ainsi, dès le
prochain autofill sur ce site, la donnée sera disponible. Pour la mise à jour de mot de passe existant,
c’est similaire sauf qu’on cible l’item à mettre à jour (il faut identifier l’item : vous pouvez utiliser le
URL+username comme clé pour retrouver l’entrée, ou mieux, avoir envoyé l’ID interne lors de la
soumission). Par exemple, le background peut lors de submittedCredentials détecter « ah cela
correspond à l’entrée ID 123 mais avec un mdp différent » et stocker cet ID dans une variable. Puis si
user confirme la mise à jour, on sait qu’il faut appeler un service updateCredential(id, newData).
(Astuce : assurez-vous que le content script ne propose pas l’enregistrement avant que l’utilisateur n’ait
effectivement réussi la connexion. Parfois, on soumet un mauvais mot de passe, le site renvoie « mot de passe
incorrect » et pourtant le gestionnaire peut avoir proposé d’enregistrer… ce qui est inutile. Pour affiner, vous
pourriez attendre un petit délai ou détecter un changement d’URL (si login redirige vers un tableau de bord,
etc.). Bitwarden par exemple attend de voir que la page a changé ou que DOM a un indicateur de login réussi
23
. Pour une v1, ce niveau de finesse peut être secondaire.)
9. Tests approfondis et ajustements de sécurité : Une fois les fonctionnalités codées, testez-les sur un
panel de sites variés : sites de login simples (sans particularité), sites avec des champs non-standards
(ex: Gmail où le login et mdp sont sur deux pages séparées), pages avec iframes tierces, etc. Assurez-
vous que : - Le content script ne provoque pas d’erreurs sur les pages sans formulaire. - L’icône/menu
apparaissent correctement là où il faut, et disparaissent quand on navigue ailleurs (utilisez
document.addEventListener('visibilitychange', ...) ou messages background pour
12
nettoyer d’anciens injections si l’onglet change de page). - En termes de sécurité, testez le scénario
iframe malveillant. Par exemple, créez une simple page HTML qui charge une iframe d’un autre
domaine contenant un formulaire « leurre » (mettez un domain différent ou un file:// local) et voyez si
votre extension évite de remplir dedans. Si ce n’est pas le cas, introduisez la condition de ne pas autofill
les iframes cross-origin comme discuté. - Vérifiez que le vault reste chiffré localement (regardez
chrome.storage.local dans le DevTools d’extension pour voir que les entrées stockées sont bien
chiffrées ou hachées, pas en clair). - Testez le verrouillage : verrouillez le vault (simulateur : supprimez la
clé en mémoire), essayez de cliquer l’icône dans un champ : l’extension doit soit ne rien faire, soit
demander le MP. - Vérifiez aussi les performances : le content script ne doit pas ralentir exagérément le
chargement des pages. Idéalement, n’utilisez pas de lourdes opérations synchrones au niveau du
content script. Votre moteur d’autofill doit être efficace. Dashlane par exemple utilise du machine
learning pour améliorer la détection 48
, mais pour débuter des règles simples suffiront. Si vous
rencontrez des sites où les champs ne sont pas reconnus (ex: champs non standard), vous pourrez
affiner progressivement la détection (ajout de plus d’attributs cibles, etc.).
10. Optimisation du code et bonnes pratiques de maintenance : Refactorez votre code en suivant
votre trois-couches architecture. Par exemple, la logique de détection de formulaires peut vivre dans
une fonction utilitaire (couche Library ou Service) distincte, pour être testable. Le content script peut
appeler une fonction importée findLoginFormFields(document) qui renvoie un objet avec
{usernameField, passwordField} ou null. La communication background<->content peut être simplifiée
en définissant un petit module de messaging (une couche d’abstraction) pour éviter d’utiliser
chrome.runtime.sendMessage partout de façon ad-hoc. Bitwarden, par exemple, a enveloppé ces
appels dans un BrowserApi commun 21 22
– vous pourriez créer quelque chose comme
ExtensionMessenger.send('getCredentials', data) et
ExtensionMessenger.on('getCredentials', handler) pour centraliser. Cela rendra le code
plus lisible. De plus, documentez dans un README technique ou dans le code les protocoles de
message, pour qu’un futur développeur (ou vous-même dans 6 mois) comprenne facilement
l’enchaînement.
Après ces étapes, vous aurez implémenté l’essentiel des fonctionnalités web de phase 1 (autofill des
logins, sauvegarde auto). Vous pouvez alors passer aux phases suivantes comme l’autofill des données
personnelles et cartes (qui reprendront un schéma similaire : détecter les formulaires d’adresse,
proposer de remplir via les données du vault), la gestion des passkeys, etc., en bâtissant sur cette
fondation. En suivant ce plan étape par étape et en vous inspirant des meilleures pratiques observées
chez les acteurs majeurs, votre extension bénéficiera d’une expérience riche pour l’utilisateur, tout en
maintenant un haut niveau de sécurité conforme aux standards actuels (architecture zero-knowledge,
isolement, consentement utilisateur) 36 42
. Bonne implémentation !
13
1 3 4 5 10 11 12 13 14 48
Autofill your data using Dashlane – Dashlane
https://support.dashlane.com/hc/en-us/articles/202699151-Autofill-your-data-using-Dashlane
2 6 7 8 15
Get to know 1Password in your browser | 1Password Support
https://support.1password.com/getting-started-browser/
9 20 21 22 30 31 35
Browser Autofill | Bitwarden Contributing Documentation
https://contributing.bitwarden.com/architecture/deep-dives/autofill/
16 23 32
Collecting Page Details | Bitwarden Contributing Documentation
https://contributing.bitwarden.com/architecture/deep-dives/autofill/collecting-page-details/
17 40 41 44 45
Bitwarden flaw can let hackers steal passwords using iframes
https://www.bleepingcomputer.com/news/security/bitwarden-flaw-can-let-hackers-steal-passwords-using-iframes/
18 19
Inline Autofill Menu | Bitwarden Contributing Documentation
https://contributing.bitwarden.com/architecture/deep-dives/autofill/autofill-menu/
24 25 26 27 28 29 33 34 38 39
ARCHITECTURE.md
https://github.com/Bptmn/SimpliPass-Chrome-Extension/blob/3d19c7fce115380821c6395dd44638ec7cf296a3/
ARCHITECTURE.md
36 37
Building for Security in a Browser Environment - Dashlane
https://www.dashlane.com/blog/web-extension-security
42 46 47
cure53.de
https://cure53.de/pentest-report_proton-pass.pdf
43
iFrame issue : r/Bitwarden - Reddit
https://www.reddit.com/r/Bitwarden/comments/1eqe0ip/iframe_issue/
14