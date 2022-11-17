# À propos de l'application Magneto

* Licence : [AGPL v3](http://www.gnu.org/licenses/agpl.txt) - Copyright Ville de Paris, Région Nouvelle Aquitaine, Région Hauts de France
* Propriétaire(s) : CGI
* Mainteneur(s) : CGI
* Financeur(s) : Ville de Paris, Région Nouvelle Aquitaine
* Description : Application de création et de gestion de tableaux dans l'OPEN ENT.

## Configuration du module magneto dans le projet OPEN ENT

Dans le fichier 'ent-core.json.template' du projet OPEN ENT :

<pre>
    {
      "name": "fr.cgi~magneto~1.0-SNAPSHOT",
      "config": {
        "main" : "fr.cgi.magneto.Magneto",
        "port" : 8205,
        "app-name" : "Magneto",
    	"app-address" : "/magneto",
    	"app-icon" : "${host}/magneto/public/img/uni-magneto.png",
        "host": "${host}",
        "ssl" : $ssl,
        "auto-redeploy": false,
        "userbook-host": "${host}",
        "integration-mode" : "HTTP",
        "app-registry.port" : 8012,
        "mode" : "${mode}",
        "entcore.port" : 8009,
        "websocket-config": {
            "wsPort": 4404,
            "endpoint-proxy": "/magneto/eventbus"
        }
      }
    }
</pre>

Associer une route d'entrée à la configuration du module proxy intégré (`"name": "com.wse~http-proxy~1.0.0"`) :
<pre>
      {
        "location": "/magneto",
        "proxy_pass": "http://localhost:8205"
      }
</pre>


## Documentation
Magneto est un outil de création permettant aux utilisateurs de créer et d’échanger des tableaux. 
Il contient des aimants, chaque aimant ayant son propre type (texte, image, lien etc..).

# Modèle de données - base MongoDB
Deux collections sont utilisées : 
* magneto.boards" : un document représente un tableau 
* magneto.cards" : un document représente un aimant

Exemple de document de la collection "magneto.boards" :

<pre>
{
"_id" : "91d937c9-9c64-4f07-b432-c07ce9e3fdcb",
"title" : "Mon premier tableau",
"imageUrl" : "/workspace/document/51e9c801-4abd-49ab-9e13-2f024723cc32",
"description" : "Ma première description",
"tags" : [
"tableau",
"keyword"
],
"public" : false,
"modificationDate" : "2022-11-17 13:56:45",
"creationDate" : "2022-11-17 13:56:45",
"deleted" : false,
"ownerId" : "fb7391bf-32f9-4380-a0fe-1762b10c4f4c",
"ownerName" : "Rhita Rahni",
"cardIds" : []
}
</pre>


Description des champs d'un document de la collection "magneto.boards" :

<pre>
{
"_id" : "Identifiant du tableau",
"title" : "Titre du tableau",
"imageUrl" : "Chemin vers une image du tableau, stockée dans l'application workspace",
"description" : "Description du tableau.  Ce champ est facultatif",
"tags" : "Tag permettant la recherche par mot-clé",
"creationDate" : "Date de création",
"modificationDate" : "Date de dernière modification",
"deleted" : "Permet de savoir si le tableau a été archivé ou non",
"ownerId" : "Identifiant du créateur du tableau",
"ownerName" : "Prénom et nom du créateur du tableau",
"public" : "Permet de savoir si le tableau a été partagé au public ou non",
"cardIds" : "Tableau contenant l'identifiant de tout les aimants le constituant"
}
</pre>

Exemple de document de la collection "magneto.cards" :

<pre>
{
"_id" : "132e3289-2534-469a-bfbc-308148616c7d",
"title" : "Mon premier aimant image",
"resourceType" : "image",
"resourceId" : "51e9c801-4abd-49ab-9e13-2f024723cc32",
"resourceUrl" : "/workspace/document/51e9c801-4abd-49ab-9e13-2f024723cc32",
"description" : "<div>Ma description</div>",
"caption" : "Ma légende",
"boardId" : "91d937c9-9c64-4f07-b432-c07ce9e3fdcb",
"modificationDate" : "2022-11-17 14:19:30",
"lastModifierId" : null,
"lastModifierName" : null,
"creationDate" : "2022-11-17 14:19:30",
"ownerId" : "fb7391bf-32f9-4380-a0fe-1762b10c4f4c",
"ownerName" : "Rahni Rhita",
"parentId" : null
}
</pre>

Description des champs d'un document de la collection "magneto.cards" :

<pre>
{
"_id" : "Identifiant de l'aimant",
"title" : "Titre de l'aimant",
"resourceType" : "Type de l'aimant (texte, image, lien etc...)",
"resourceId" : "Identifiant de la ressource contenue dans le workspace",
"resourceUrl" : "Lien de la ressource (workspace ou externe)",
"description" : "Description de l'aimant",
"caption" : "Légende de l'aimant",
"boardId" : "Identifiant du tableau contenant l'aimant",
"creationDate" : "Date de création",
"modificationDate" : "Date de dernière modification",
"lastModifierId" : "Identifiant du dernier utilisateur ayant modifié l'aimant",
"lastModifierName" : "Prénom et nom du dernier utilisateur ayant modifié l'aimant",
"ownerId" : "Identifiant du créateur de l'aimant",
"ownerName" : "Prénom et nom du créateur de l'aimant",
"parentId" : "Identifiant de l'aimant parent si l'aimant a été dupliqué"
}
</pre>

# Gestion des droits
Les droits de type "resource" sont gérés au niveau des boards.
On en distingue 4 :
* Lecture ("magneto.read") : lecture des tableaux
* Contribution ("magneto.contrib") : réutilisation des tableaux / aimants
* Modération ("magneto.publish") : créer des tableaux / gestion des aimants
* Gestion ("magneto.manager") : modification des tableaux

Il y a 3 droits de type "workflow" :
* "magneto.board.publish" : Partage et publication de tableau
* "magneto.board.manage" : Création et gestion de tableau
* "magneto.view" : Accéder a Magneto


# Modèle front-end

Le modèle front-end manipule 3 types d'objets :
* "Boards" comprend une collection de "Board"
* "Cards" comprend une collection de "Card"
* "Folder"


