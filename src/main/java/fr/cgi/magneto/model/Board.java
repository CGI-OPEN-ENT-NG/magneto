package fr.cgi.magneto.model;

import fr.cgi.magneto.core.constants.*;
import fr.cgi.magneto.helper.DateHelper;
import io.vertx.core.json.*;

import java.util.*;

public class Board implements Model<Board> {

    private String _id;
    private String title;
    private String imageUrl;
    private String description;
    private String ownerId;
    private String ownerName;
    private List<String> cardIds;
    private String creationDate;
    private String modificationDate;
    private boolean isDeleted;
    private boolean isPublic;
    private String folderId;

    public Board() {
        this.setDeleted(false);
        this.setPublic(false);
        this.setCardIds(new ArrayList<>());
        this.setCreationDate(DateHelper.getDateString(new Date(), DateHelper.MONGO_FORMAT));
        this.setModificationDate(DateHelper.getDateString(new Date(), DateHelper.MONGO_FORMAT));
    }

    @SuppressWarnings("unchecked")
    public Board(JsonObject board) {
        this._id = board.getString(Field._ID);
        this.title = board.getString(Field.TITLE);
        this.imageUrl = board.getString(Field.IMAGEURL);
        this.description = board.getString(Field.DESCRIPTION);
        this.ownerId = board.getString(Field.OWNERID);
        this.ownerName = board.getString(Field.OWNERNAME);
        this.cardIds = board.getJsonArray(Field.CARDIDS, new JsonArray()).getList();
        this.creationDate = board.getString(Field.CREATIONDATE);
        this.modificationDate = board.getString(Field.MODIFICATIONDATE);
        this.isDeleted = board.getBoolean(Field.DELETED, false);
        this.isPublic = board.getBoolean(Field.PUBLIC, false);
        this.folderId = board.getString(Field.FOLDERID);
        this.setCreationDate(DateHelper.getDateString(new Date(), DateHelper.MONGO_FORMAT));
        this.setModificationDate(DateHelper.getDateString(new Date(), DateHelper.MONGO_FORMAT));
    }

    public String getId() {
        return _id;
    }

    public void setId(String id) {
        this._id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(String ownerId) {
        this.ownerId = ownerId;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }

    public List<String> getCardIds() {
        return cardIds;
    }

    public void setCardIds(List<String> cardIds) {
        this.cardIds = cardIds;
    }

    public String getCreationDate() {
        return creationDate;
    }

    public void setCreationDate(String creationDate) {
        this.creationDate = creationDate;
    }

    public String getModificationDate() {
        return modificationDate;
    }

    public void setModificationDate(String modificationDate) {
        this.modificationDate = modificationDate;
    }

    public boolean isDeleted() {
        return isDeleted;
    }

    public void setDeleted(boolean deleted) {
        isDeleted = deleted;
    }

    public String getFolderId() {
        return folderId;
    }

    public void setFolderId(String folderId) {
        this.folderId = folderId;
    }

    public boolean isPublic() {
        return isPublic;
    }

    public void setPublic(boolean aPublic) {
        isPublic = aPublic;
    }


    @Override
    public JsonObject toJson() {
        return new JsonObject()
                .put(Field._ID, this.getId())
                .put(Field.TITLE, this.getTitle())
                .put(Field.IMAGEURL, this.getImageUrl())
                .put(Field.DESCRIPTION, this.getDescription())
                .put(Field.OWNERID, this.getOwnerId())
                .put(Field.OWNERNAME, this.getOwnerName())
                .put(Field.CARDIDS, new JsonArray(this.getCardIds()))
                .put(Field.CREATIONDATE, this.getCreationDate())
                .put(Field.MODIFICATIONDATE, this.getModificationDate())
                .put(Field.DELETED, this.isDeleted())
                .put(Field.PUBLIC, this.isPublic())
                .put(Field.FOLDERID, this.getFolderId());

    }

    @Override
    public Board model(JsonObject board) {
        return new Board(board);
    }
}
