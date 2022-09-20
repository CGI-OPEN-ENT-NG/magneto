package fr.cgi.magneto.model;

import fr.cgi.magneto.core.constants.*;
import fr.cgi.magneto.helper.*;
import io.vertx.core.json.*;

import java.util.*;

public class BoardPayload implements Model<BoardPayload> {
    private String _id;
    private String title;
    private String imageUrl;
    private String description;
    private String ownerId;
    private String ownerName;
    private String creationDate;
    private String modificationDate;
    private String folderId;


    public BoardPayload(JsonObject board) {
        this._id = board.getString(Field._ID, null);
        this.title = board.getString(Field.TITLE);
        this.imageUrl = board.getString(Field.IMAGEURL);
        this.description = board.getString(Field.DESCRIPTION);
        this.ownerId = board.getString(Field.OWNERID);
        this.ownerName = board.getString(Field.OWNERNAME);
        this.creationDate = board.getString(Field.CREATIONDATE);
        this.modificationDate = board.getString(Field.MODIFICATIONDATE);
        this.folderId = board.getString(Field.FOLDERID);
        this.setCreationDate(DateHelper.getDateString(new Date(), DateHelper.MONGO_FORMAT));
        this.setModificationDate(DateHelper.getDateString(new Date(), DateHelper.MONGO_FORMAT));
    }

    public String getId() {
        return _id;
    }

    public BoardPayload setId(String id) {
        this._id = id;
        return this;
    }

    public String getTitle() {
        return title;
    }

    public BoardPayload setTitle(String title) {
        this.title = title;
        return this;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public BoardPayload setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
        return this;
    }

    public String getDescription() {
        return description;
    }

    public BoardPayload setDescription(String description) {
        this.description = description;
        return this;
    }

    public String getOwnerId() {
        return ownerId;
    }

    public BoardPayload setOwnerId(String ownerId) {
        this.ownerId = ownerId;
        return this;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public BoardPayload setOwnerName(String ownerName) {
        this.ownerName = ownerName;
        return this;
    }

    public String getCreationDate() {
        return creationDate;
    }

    public BoardPayload setCreationDate(String creationDate) {
        this.creationDate = creationDate;
        return this;
    }

    public String getFolderId() {
        return folderId;
    }

    public BoardPayload setFolderId(String folderId) {
        this.folderId = folderId;
        return this;
    }

    public String getModificationDate() {
        return modificationDate;
    }

    public BoardPayload setModificationDate(String modificationDate) {
        this.modificationDate = modificationDate;
        return this;
    }


    @Override
    public JsonObject toJson() {

        JsonObject json = new JsonObject()
                .put(Field.TITLE, this.getTitle())
                .put(Field.IMAGEURL, this.getImageUrl())
                .put(Field.DESCRIPTION, this.getDescription())
                .put(Field.MODIFICATIONDATE, this.getModificationDate());

        // If create
        if (this.getId() == null) {
            json.put(Field.CREATIONDATE, this.getCreationDate())
                    .put(Field.DELETED, false)
                    .put(Field.PUBLIC, false)
                    .put(Field.FOLDERID, this.getFolderId())
                    .put(Field.OWNERID, this.getOwnerId())
                    .put(Field.OWNERNAME, this.getOwnerName())
                    .put(Field.CARDIDS, new JsonArray());
        }

        return json;
    }

    @Override
    public BoardPayload model(JsonObject board) {
        return new BoardPayload(board);
    }
}
