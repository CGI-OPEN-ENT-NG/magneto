package fr.cgi.magneto.model;

import fr.cgi.magneto.core.constants.*;
import io.vertx.core.json.*;

public class FolderPayload implements Model<FolderPayload>{
    private String title;
    private String parentId;
    private String ownerId;

    public FolderPayload(JsonObject folder) {
        this.title = folder.getString(Field.TITLE, "");
        this.parentId = folder.getString(Field.PARENTID, null);
        this.ownerId = folder.getString(Field.OWNERID, null);
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

    @Override
    public JsonObject toJson() {
        return new JsonObject()
                .put(Field.TITLE, this.title)
                .put(Field.PARENTID, this.parentId)
                .put(Field.OWNERID, this.ownerId);
    }

    @Override
    public FolderPayload model(JsonObject folder) {
        return new FolderPayload(folder);
    }
}
