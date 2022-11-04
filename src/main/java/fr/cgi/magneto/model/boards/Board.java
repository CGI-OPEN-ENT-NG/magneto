package fr.cgi.magneto.model.boards;

import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.helper.DateHelper;
import fr.cgi.magneto.helper.ModelHelper;
import fr.cgi.magneto.model.Model;
import fr.cgi.magneto.model.cards.Card;
import fr.cgi.magneto.model.user.User;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

public class Board implements Model<Board> {
    private String _id;
    private String title;
    private String imageUrl;
    private String description;
    private User owner;
    private JsonArray shared;
    private String creationDate;
    private String modificationDate;
    private boolean isDeleted;
    private boolean isPublic;
    private String folderId;
    private List<Card> cards;
    private List<String> tags;

    @SuppressWarnings("unchecked")
    public Board(JsonObject board) {
        this._id = board.getString(Field._ID, null);
        this.title = board.getString(Field.TITLE);
        this.imageUrl = board.getString(Field.IMAGEURL);
        this.description = board.getString(Field.DESCRIPTION);
        this.owner = new User(board.getString(Field.OWNERID), board.getString(Field.OWNERNAME));
        this.shared = board.getJsonArray(Field.SHARED, new JsonArray());
        this.isPublic = board.getBoolean(Field.PUBLIC, false);
        this.folderId = board.getString(Field.FOLDERID);
        this.modificationDate = board.getString(Field.MODIFICATIONDATE);
        JsonArray cardsArray = new JsonArray(((List<String>) board.getJsonArray(Field.CARDIDS, new JsonArray()).getList())
                .stream()
                .map(id -> new JsonObject().put(Field._ID, id))
                .collect(Collectors.toList()));
        this.cards = ModelHelper.toList(cardsArray, Card.class);
        this.tags = board.getJsonArray(Field.TAGS, new JsonArray()).getList();
        if (this.getId() == null) {
            this.setCreationDate(DateHelper.getDateString(new Date(), DateHelper.MONGO_FORMAT));
            this.setModificationDate(DateHelper.getDateString(new Date(), DateHelper.MONGO_FORMAT));
        }

    }

    public String getId() {
        return _id;
    }

    public Board setId(String id) {
        this._id = id;
        return this;
    }

    public String getTitle() {
        return title;
    }

    public Board setTitle(String title) {
        this.title = title;
        return this;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public Board setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
        return this;
    }

    public String getDescription() {
        return description;
    }

    public Board setDescription(String description) {
        this.description = description;
        return this;
    }

    public String getOwnerId() {
        return this.owner.getUserId();
    }

    public Board setOwnerId(String ownerId) {
        this.owner.setUserId(ownerId);
        return this;
    }

    public String getOwnerName() {
        return this.owner.getUsername();
    }

    public Board setUserName(String ownerName) {
        this.owner.setUsername(ownerName);
        return this;
    }

    public String getCreationDate() {
        return creationDate;
    }

    public Board setCreationDate(String creationDate) {
        this.creationDate = creationDate;
        return this;
    }

    public String getFolderId() {
        return folderId;
    }

    public Board setFolderId(String folderId) {
        this.folderId = folderId;
        return this;
    }

    public String getModificationDate() {
        return modificationDate;
    }

    public Board setModificationDate(String modificationDate) {
        this.modificationDate = modificationDate;
        return this;
    }


    public boolean isDeleted() {
        return isDeleted;
    }

    public Board setDeleted(boolean isDeleted) {
        this.isDeleted = isDeleted;
        return this;
    }

    public boolean isPublic() {
        return isPublic;
    }

    public Board setPublic(boolean isPublic) {
        this.isPublic = isPublic;
        return this;
    }

    public List<Card> cards() {
        return this.cards;
    }

    public Board setCards(List<Card> cards) {
        this.cards = cards;
        return this;
    }

    public List<String> tags() {
        return this.tags;
    }

    public Board setTags(List<String> tags) {
        this.tags = tags;
        return this;
    }

    @Override
    public JsonObject toJson() {
        JsonArray cardsArray =
                new JsonArray(this.cards().stream().map(Card::getId).collect(Collectors.toList()));
        return new JsonObject()
                .put(Field._ID, this.getId())
                .put(Field.TITLE, this.getTitle())
                .put(Field.IMAGEURL, this.getImageUrl())
                .put(Field.DESCRIPTION, this.getDescription())
                .put(Field.MODIFICATIONDATE, this.getModificationDate())
                .put(Field.CARDIDS, cardsArray)
                .put(Field.CREATIONDATE, this.getCreationDate())
                .put(Field.DELETED, this.isDeleted())
                .put(Field.PUBLIC, this.isPublic())
                .put(Field.FOLDERID, this.getFolderId())
                .put(Field.OWNERID, this.getOwnerId())
                .put(Field.OWNERNAME, this.getOwnerName())
                .put(Field.SHARED, this.shared)
                .put(Field.TAGS, this.tags());
}

    @Override
    public Board model(JsonObject board) {
        return new Board(board);
    }

}
