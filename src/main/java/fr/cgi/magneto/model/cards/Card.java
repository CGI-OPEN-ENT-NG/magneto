package fr.cgi.magneto.model.cards;

import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.helper.DateHelper;
import fr.cgi.magneto.model.Metadata;
import fr.cgi.magneto.model.Model;
import fr.cgi.magneto.model.user.User;
import io.vertx.core.json.JsonObject;

import java.util.Date;

public class Card implements Model<Card> {

    private String _id;
    private String title;
    private String resourceId;
    private String resourceType;
    private String resourceUrl;
    private String description;
    private User owner;
    private User editor;
    private String creationDate;
    private String modificationDate;
    private String caption;
    private String parentId;
    private String boardId;
    private Metadata metadata;


    public Card(JsonObject card) {
        this._id = card.getString(Field._ID, null);
        this.title = card.getString(Field.TITLE);
        this.resourceId = card.getString(Field.RESOURCEID);
        this.resourceType = card.getString(Field.RESOURCETYPE);
        this.resourceUrl = card.getString(Field.RESOURCEURL);
        this.owner = new User(card.getString(Field.OWNERID), card.getString(Field.OWNERNAME));
        this.editor = new User(card.getString(Field.LASTMODIFIERID), card.getString(Field.LASTMODIFIERNAME));
        this.caption = card.getString(Field.CAPTION);
        this.description = card.getString(Field.DESCRIPTION);
        this.parentId = card.getString(Field.PARENTID);
        this.boardId = card.getString(Field.BOARDID);
        this.modificationDate = card.getString(Field.MODIFICATIONDATE);
        this.metadata = null;

        if (this.getId() == null) {
            this.setCreationDate(DateHelper.getDateString(new Date(), DateHelper.MONGO_FORMAT));
            this.setModificationDate(DateHelper.getDateString(new Date(), DateHelper.MONGO_FORMAT));
        }
    }

    public String getId() {
        return _id;
    }

    public Card setId(String id) {
        this._id = id;
        return this;
    }

    public String getTitle() {
        return title;
    }

    public Card setTitle(String title) {
        this.title = title;
        return this;
    }

    public String getOwnerId() {
        return owner.getUserId();

    }

    public Card setOwnerId(String ownerId) {
        this.owner.setUserId(ownerId);
        return this;
    }

    public String getOwnerName() {
        return owner.getUsername();
    }

    public Card setOwnerName(String ownerName) {
        this.owner.setUsername(ownerName);
        return this;
    }

    public String getCreationDate() {
        return creationDate;
    }

    public Card setCreationDate(String creationDate) {
        this.creationDate = creationDate;
        return this;
    }

    public String getCaption() {
        return caption;
    }

    public Card setCaption(String caption) {
        this.caption = caption;
        return this;
    }

    public String getModificationDate() {
        return modificationDate;
    }

    public Card setModificationDate(String modificationDate) {
        this.modificationDate = modificationDate;
        return this;
    }

    public String getResourceType() {
        return resourceType;
    }

    public Card setResourceType(String resourceType) {
        this.resourceType = resourceType;
        return this;
    }

    public String getLastModifierId() {
        return editor.getUserId();
    }

    public Card setLastModifierId(String lastModifierId) {
        this.editor.setUserId(lastModifierId);
        return this;
    }

    public String getLastModifierName() {
        return editor.getUsername();
    }

    public Card setLastModifierName(String lastModifierName) {
        this.editor.setUsername(lastModifierName);
        return this;
    }

    public String getParentId() {
        return parentId;
    }

    public Card setParentId(String parentId) {
        this.parentId = parentId;
        return this;
    }

    public String getDescription() {
        return description;
    }

    public Card setDescription(String description) {
        this.description = description;
        return this;
    }

    public String getResourceId() {
        return resourceId;
    }

    public Card setResourceId(String resourceId) {
        this.resourceId = resourceId;
        return this;
    }

    public String getBoardId() {
        return boardId;
    }

    public Card setBoardId(String boardId) {
        this.boardId = boardId;
        return this;
    }

    public Metadata getMetadata() {
        return metadata;
    }

    public Card setMetadata(Metadata metadata) {
        this.metadata = metadata;
        return this;
    }

    public String getResourceUrl() {
        return resourceUrl;
    }

    public Card setResourceUrl(String resourceUrl) {
        this.resourceUrl = resourceUrl;
        return this;
    }

    @Override
    public JsonObject toJson() {

        JsonObject json = new JsonObject()
                .put(Field.TITLE, this.getTitle())
                .put(Field.RESOURCETYPE, this.getResourceType())
                .put(Field.RESOURCEID, this.getResourceId())
                .put(Field.RESOURCEURL, this.getResourceUrl())
                .put(Field.DESCRIPTION, this.getDescription())
                .put(Field.CAPTION, this.getCaption())
                .put(Field.MODIFICATIONDATE, this.getModificationDate())
                .put(Field.LASTMODIFIERID, this.getLastModifierId())
                .put(Field.LASTMODIFIERNAME, this.getLastModifierName());

        // If create
        if (this.getId() == null) {
            json.put(Field.CREATIONDATE, this.getCreationDate())
                    .put(Field.OWNERID, this.getOwnerId())
                    .put(Field.OWNERNAME, this.getOwnerName())
                    .put(Field.BOARDID, this.getBoardId())
                    .put(Field.PARENTID, this.getParentId());
        }

        return json;
    }

    @Override
    public Card model(JsonObject card) {
        return new Card(card);
    }

}

