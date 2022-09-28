package fr.cgi.magneto.model;

import fr.cgi.magneto.core.constants.*;
import io.vertx.core.json.*;

public class FolderPayload implements Model<FolderPayload>{
    private String _id;
    private String title;
    private String parentId;
    private String ownerId;
    private boolean deleted;

    public FolderPayload(JsonObject folder) {
        this._id = folder.getString(Field._ID, null);
        this.title = folder.getString(Field.TITLE, "");
        this.parentId = folder.getString(Field.PARENTID, null);
        this.ownerId = folder.getString(Field.OWNERID, null);
        this.deleted = folder.getBoolean(Field.DELETED, false);
    }

    public String getId() {
        return _id;
    }

    public FolderPayload setId(String id) {
        this._id = id;
        return this;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getParentId() {
        return parentId;
    }

    public void setParentId(String parentId) {
        this.parentId = parentId;
    }

    public String getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(String ownerId) {
        this.ownerId = ownerId;
    }

    public boolean isDeleted() {
        return deleted;
    }

    public void setDeleted(boolean deleted) {
        this.deleted = deleted;
    }

    @Override
    public JsonObject toJson() {
        JsonObject json = new JsonObject()
                .put(Field.TITLE, this.title);

        // If create
        if (this.getId() == null) {
            json.put(Field.OWNERID, this.ownerId)
                .put(Field.DELETED, this.deleted)
                .put(Field.PARENTID, this.parentId);
        }

        return json;
    }

    @Override
    public FolderPayload model(JsonObject folder) {
        return new FolderPayload(folder);
    }
}
