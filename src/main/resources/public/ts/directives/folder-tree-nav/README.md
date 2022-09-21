# Directive FolderTreeNav

## Forme HTML

```html
<folder-tree-nav
	folder-trees="vm.folderNavTrees"
	folder-tree-eventer="vm.folderNavTreeSubject"
	on-select-folder="vm.switchFolder">
</folder-tree-nav>
 ```

## Implémentation

### Propriétés attendues

|  Propriété | Type attendu  | Description  |
| :------------ | :------------ | :------------ |
|  folder-trees |  Array\<FolderTreeNavItem\> | Liste des objets dossier : <br> - _id : identifiant du dossier <br> - _name: nom du dossier <br> - _iconClass: classe CSS pour l'icône (optionnel) <br> - _children : liste des dossiers enfants <br> - _parentId: identifiant du dossier parent <br> - _isOpened: dossier ouvert ou non  |
|  folder-tree-eventer | Subject\<FolderTreeNavItem\>  |  Subject qui recoit un signal quand un dossier est selectionné |
|  on-select-folder | function = (folder: FolderTreeNav) => void  | Callback pour gérer la selection de dossier dans le controller parent  |


## Pour créer l'arborescence

A partir d'une liste de dossiers (objets avec id, title et parentId), on peut construire l'arboresence comme suivant :

```javascript
vm.foldersNavTrees= [];
vm.foldersNavTrees.push(new FolderTreeNavItem({
	id: "id1",
	title: "Mes Tableaux",
	parentId: null
}, "magneto-check-decagram")).buildFolders(vm.folders);
```

Ici on créer une catégorie "Mes tableaux" qui va contenir la liste des folders en tenant compte de la hierarchie des fichiers. L'id précisé est arbitraire.

