package fr.cgi.magneto.service.impl;

import com.mongodb.QueryBuilder;
import fr.cgi.magneto.Magneto;
import fr.cgi.magneto.core.constants.CollectionsConstant;
import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.core.constants.Mongo;
import fr.cgi.magneto.helper.ModelHelper;
import fr.cgi.magneto.helper.PromiseHelper;
import fr.cgi.magneto.model.Metadata;
import fr.cgi.magneto.model.MongoQuery;
import fr.cgi.magneto.model.boards.Board;
import fr.cgi.magneto.model.boards.BoardPayload;
import fr.cgi.magneto.model.cards.Card;
import fr.cgi.magneto.model.cards.CardPayload;
import fr.cgi.magneto.service.BoardService;
import fr.cgi.magneto.service.CardService;
import fr.cgi.magneto.service.ServiceFactory;
import fr.cgi.magneto.service.WorkspaceService;
import fr.wseduc.mongodb.MongoDb;
import fr.wseduc.mongodb.MongoQueryBuilder;
import io.vertx.core.CompositeFuture;
import io.vertx.core.Future;
import io.vertx.core.Promise;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.common.mongodb.MongoDbResult;
import org.entcore.common.user.UserInfos;

import java.util.*;
import java.util.stream.Collectors;

public class DefaultCardService implements CardService {

    private final MongoDb mongoDb;

    private final String collection;

    private final WorkspaceService workspaceService;
    private final BoardService boardService;

    protected static final Logger log = LoggerFactory.getLogger(DefaultCardService.class);


    public DefaultCardService(String collection, MongoDb mongo, ServiceFactory serviceFactory) {
        this.collection = collection;
        this.mongoDb = mongo;
        this.boardService = serviceFactory.boardService();
        this.workspaceService = serviceFactory.workSpaceService();
    }

    @Override
    public Future<JsonObject> create(CardPayload card, String id) {
        Promise<JsonObject> promise = Promise.promise();
        mongoDb.insert(this.collection, card.toJson().put(Field._ID, id), MongoDbResult.validResultHandler(results -> {
            if (results.isLeft()) {
                String message = String.format("[Magneto@%s::create] Failed to create card", this.getClass().getSimpleName());
                log.error(String.format("%s. %s", message, results.left().getValue()));
                promise.fail(message);
                return;
            }
            promise.complete(results.right().getValue());
        }));
        return promise.future();
    }

    @Override
    public Future<JsonObject> update(UserInfos user, CardPayload card) {
        Promise<JsonObject> promise = Promise.promise();
        JsonObject query = new JsonObject()
                .put(Field._ID, card.getId())
                .put(Field.OWNERID, user.getUserId());
        JsonObject update = new JsonObject().put(Mongo.SET, card.toJson());
        mongoDb.update(this.collection, query, update, MongoDbResult.validActionResultHandler(results -> {
            if (results.isLeft()) {
                String message = String.format("[Magneto@%s::update] Failed to update card", this.getClass().getSimpleName());
                log.error(String.format("%s : %s", message, results.left().getValue()));
                promise.fail(message);
                return;
            }
            promise.complete(results.right().getValue());
        }));
        return promise.future();
    }

    @Override
    public Future<JsonObject> deleteCards(String userId, List<String> cardIds) {
        Promise<JsonObject> promise = Promise.promise();
        JsonObject query = new JsonObject()
                .put(Field._ID, new JsonObject().put(Mongo.IN, new JsonArray(cardIds)))
                .put(Field.OWNERID, userId);
        mongoDb.delete(this.collection, query, MongoDbResult.validActionResultHandler(results -> {
            if (results.isLeft()) {
                String message = String.format("[Magneto@%s::deleteCards] Failed to delete cards",
                        this.getClass().getSimpleName());
                log.error(String.format("%s : %s", message, results.left().getValue()));
                promise.fail(message);
                return;
            }
            promise.complete(results.right().getValue());
        }));
        return promise.future();
    }

    @Override
    public Future<JsonObject> deleteCardsByBoards(List<String> boardIds) {
        Promise<JsonObject> promise = Promise.promise();
        JsonObject query = new JsonObject()
                .put(Field.BOARDID, new JsonObject().put(Mongo.IN, new JsonArray(boardIds)));
        mongoDb.delete(this.collection, query, MongoDbResult.validActionResultHandler(results -> {
            if (results.isLeft()) {
                String message = String.format("[Magneto@%s::deleteCardsByBoards] Failed to delete cards by board ids",
                        this.getClass().getSimpleName());
                log.error(String.format("%s : %s", message, results.left().getValue()));
                promise.fail(message);
                return;
            }
            promise.complete(results.right().getValue());
        }));
        return promise.future();
    }


    @Override
    public Future<JsonObject> getLastCard(CardPayload card) {
        Promise<JsonObject> promise = Promise.promise();
        QueryBuilder matcher = QueryBuilder.start(Field.OWNERID).is(card.getOwnerId())
                .and(Field.CREATIONDATE).is(card.getCreationDate())
                .and(Field.TITLE).is(card.getTitle());

        mongoDb.findOne(this.collection, MongoQueryBuilder.build(matcher), MongoDbResult.validResultHandler(results -> {
            if (results.isLeft()) {
                String message = String.format("[Magneto@%s::getLastCard] Failed to get last card", this.getClass().getSimpleName());
                log.error(String.format("%s. %s", message, results.left().getValue()));
                promise.fail(message);
                return;
            }
            promise.complete(results.right().getValue());
        }));
        return promise.future();
    }

    @Override
    public Future<JsonObject> getAllCards(UserInfos user, String boardId, Integer page, boolean isPublic, boolean isShared, String searchText, String sortBy) {
        Promise<JsonObject> promise = Promise.promise();

        Future<JsonArray> fetchAllCardsCountFuture = fetchAllCardsCount(user, boardId, page, isPublic, isShared, searchText, sortBy, true);
        Future<List<Card>> fetchAllCardsFuture = fetchAllCards(user, boardId, page, isPublic, isShared, searchText, sortBy);


        CompositeFuture.all(fetchAllCardsFuture, fetchAllCardsCountFuture)
                .compose(success -> setMetadataCards(fetchAllCardsFuture.result()))
                .onFailure(fail -> {
                    log.error("[Magneto@%s::getAllCards] Failed to get cards", this.getClass().getSimpleName(),
                            fail.getMessage());
                    promise.fail(fail.getMessage());
                })
                .onSuccess(cards -> {
                    int cardsCount = (fetchAllCardsCountFuture.result().isEmpty()) ? 0 :
                            fetchAllCardsCountFuture.result().getJsonObject(0).getInteger(Field.COUNT);
                    promise.complete(new JsonObject()
                            .put(Field.ALL, cards)
                            .put(Field.PAGE, cardsCount)
                            .put(Field.PAGECOUNT, cardsCount <= Magneto.PAGE_SIZE ?
                                    0 : (long) Math.ceil(cardsCount / (double) Magneto.PAGE_SIZE)));
                });
        return promise.future();
    }

    @Override
    public Future<List<Card>> getCards(List<String> cardIds) {
        Promise<List<Card>> promise = Promise.promise();
        getCardsRequest(cardIds)
                .compose(cards -> {
                    List<Card> cardList = ModelHelper.toList(cards.getJsonArray(Field.RESULTS), Card.class);
                    return setMetadataCards(cardList);
                })
                .onFailure(promise::fail)
                .onSuccess(cards -> {
                    if (cards.isEmpty()) {
                        promise.fail(String.format("[Magneto%s::getCards] No cards found", this.getClass().getSimpleName()));
                    } else {
                        promise.complete(cards);
                    }
                });
        return promise.future();
    }

    private Future<JsonObject> getCardsRequest(List<String> cardIds) {
        Promise<JsonObject> promise = Promise.promise();
        QueryBuilder matcher = QueryBuilder.start(Field._ID).in(cardIds);
        mongoDb.find(this.collection, MongoQueryBuilder.build(matcher), MongoDbResult.validActionResultHandler(PromiseHelper.handler(promise,
                String.format("[Magneto@%s::getCardsRequest] Failed to get cards request", this.getClass().getSimpleName()))));
        return promise.future();
    }

    @Override
    public Future<JsonObject> getAllCardsByBoard(UserInfos user, Board board, Integer page, boolean isSection) {
        Promise<JsonObject> promise = Promise.promise();

        Future<JsonArray> fetchAllCardsCountFuture = fetchAllCardsByBoardCount(user, board, isSection, page, true);

        Future<List<Card>> fetchAllCardsFuture = fetchAllCardsByBoard(user, board, isSection, page);


        CompositeFuture.all(fetchAllCardsFuture, fetchAllCardsCountFuture)
                .compose(success -> setMetadataCards(fetchAllCardsFuture.result()))
                .onFailure(fail -> {
                    log.error("[Magneto@%s::getAllCardsByBoard] Failed to get cards", this.getClass().getSimpleName(),
                            fail.getMessage());
                    promise.fail(fail.getMessage());
                })
                .onSuccess(cards -> {
                    int cardsCount = (fetchAllCardsCountFuture.result().isEmpty()) ? 0 :
                            fetchAllCardsCountFuture.result().getJsonObject(0).getInteger(Field.COUNT);
                    promise.complete(new JsonObject()
                            .put(Field.ALL, cards)
                            .put(Field.PAGE, cardsCount)
                            .put(Field.PAGECOUNT, cardsCount <= Magneto.PAGE_SIZE ?
                                    0 : (long) Math.ceil(cardsCount / (double) Magneto.PAGE_SIZE)));
                });


        return promise.future();
    }

    public Future<JsonObject> duplicateCards(String boardId, List<Card> cards, UserInfos user) {
        Promise<JsonObject> promise = Promise.promise();
        boardService.getBoards(Collections.singletonList(boardId))
                .compose(boardResult -> {
                    if (!boardResult.isEmpty()) {
                        return duplicateCardsFuture(boardId, cards, boardResult.get(0), user);
                    } else {
                        return Future.failedFuture(String.format("[Magneto%s::duplicateCards] " +
                                "No board found with id %s", this.getClass().getSimpleName(), boardId));
                    }
                })
                .onSuccess(promise::complete)
                .onFailure(promise::fail);
        return promise.future();
    }

    public Future<JsonObject> updateBoard(BoardPayload board) {
        if (board == null) {
            String message = String.format("[Magneto@%s::updateBoard] Failed to update board",
                    this.getClass().getSimpleName());
            return Future.failedFuture(message);
        }
        return boardService.update(board);
    }

    private Future<JsonObject> duplicateCardsFuture(String boardId, List<Card> cards, Board boardResult, UserInfos user) {
        Promise<JsonObject> promise = Promise.promise();
        BoardPayload boardPayload = new BoardPayload(boardResult.toJson());
        List<Future> duplicateFutures = new ArrayList<>();
        for (Card card : cards) {
            duplicateFutures.add(duplicateCard(boardId, card, user));
        }

        CompositeFuture.all(duplicateFutures)
                .compose(result -> {
                    List<String> newCardIds = new ArrayList<>();
                    for (Future duplicateFuture : duplicateFutures) {
                        newCardIds.add(String.valueOf(duplicateFuture.result()));
                    }
                    boardPayload.addCards(newCardIds);
                    return this.updateBoard(boardPayload);
                })
                .onSuccess(promise::complete)
                .onFailure(fail -> {
                    String message = String.format("[Magneto@%s::duplicateCardsFuture] Failed to duplicate cards : %s",
                            this.getClass().getSimpleName(), fail.getMessage());
                    promise.fail(message);
                });
        return promise.future();
    }

    private Future<String> duplicateCard(String boardId, Card card, UserInfos user) {
        Promise<String> promise = Promise.promise();
        CardPayload cardPayload = new CardPayload(card.toJson());
        String newId = UUID.randomUUID().toString();
        cardPayload.setId(null);
        cardPayload.setOwnerId(user.getUserId());
        cardPayload.setOwnerName(user.getUsername());
        cardPayload.setBoardId(boardId);
        cardPayload.setParentId(card.getId());
        this.create(cardPayload, newId)
                .compose(createCardResult -> {
                    promise.complete(newId);
                    return Future.succeededFuture();
                });
        return promise.future();
    }

    private Future<List<Card>> setMetadataCards(List<Card> cards) {
        Promise<List<Card>> promise = Promise.promise();
        Future<Void> current = Future.succeededFuture();
        for (Card card : cards) {
            current = current.compose(v -> setMetadataCard(card));
        }
        current
                .onSuccess(res -> promise.complete(cards))
                .onFailure(fail -> {
                    String message = String.format("[Magneto@%s::setMetadataCards] Failed to fetch metadata : %s",
                            this.getClass().getSimpleName(), fail.getMessage());
                    promise.fail(message);
                });
        return promise.future();
    }

    private Future<Void> setMetadataCard(Card card) {
        Promise<Void> promise = Promise.promise();
        if (card.getResourceId() != null && !Objects.equals(card.getResourceId(), "")) {
            workspaceService.getDocument(card.getResourceId())
                    .onSuccess(document -> {
                        if (document.containsKey(Field._ID) && !document.containsKey(Field.RESULT)) {
                            card.setMetadata(new Metadata(document.getJsonObject(Field.METADATA)));
                        }
                        promise.complete();
                    })
                    .onFailure(fail -> {
                        String message = String.format("[Magneto@%s::setMetadataCard] Failed to get document : %s",
                                this.getClass().getSimpleName(), fail.getMessage());
                        log.error(message);
                        promise.fail(message);
                    });
        } else {
            promise.complete();
        }
        return promise.future();
    }

    private Future<List<Card>> fetchAllCardsByBoard(UserInfos user, Board board, boolean isSection, Integer page) {
        Promise<List<Card>> promise = Promise.promise();
        JsonObject query = this.getAllCardsByBoardQuery(user, board, false, page, false);
        mongoDb.command(query.toString(), MongoDbResult.validResultHandler(either -> {
            if (either.isLeft()) {
                log.error("[Magneto@%s::fetchAllCardsByBoard] Failed to get cards", this.getClass().getSimpleName(),
                        either.left().getValue());
                promise.fail(either.left().getValue());
            } else {
                JsonArray result = either.right().getValue()
                        .getJsonObject(Field.CURSOR, new JsonObject())
                        .getJsonArray(Field.FIRSTBATCH, new JsonArray());
                promise.complete(ModelHelper.toList(result, Card.class));
            }
        }));
        return promise.future();
    }

    private Future<JsonArray> fetchAllCardsByBoardCount(UserInfos user, Board boardId, boolean isSection, Integer page, boolean getCount) {
        Promise<JsonArray> promise = Promise.promise();
        JsonObject query = this.getAllCardsByBoardQuery(user, boardId, false, page, getCount);
        mongoDb.command(query.toString(), MongoDbResult.validResultHandler(either -> {
            if (either.isLeft()) {
                log.error("[Magneto@%s::fetchAllCardsByBoard] Failed to get cards", this.getClass().getSimpleName(),
                        either.left().getValue());
                promise.fail(either.left().getValue());
            } else {
                JsonArray result = either.right().getValue()
                        .getJsonObject(Field.CURSOR, new JsonObject())
                        .getJsonArray(Field.FIRSTBATCH, new JsonArray());
                promise.complete(result);
            }
        }));
        return promise.future();
    }

    private Future<List<Card>> fetchAllCards(UserInfos user, String boardId, Integer page, boolean isPublic, boolean isShared, String searchText,
                                             String sortBy) {

        Promise<List<Card>> promise = Promise.promise();

        JsonObject query = this.getAllCardsQuery(user, boardId, page, isPublic, isShared, searchText, sortBy, false);

        mongoDb.command(query.toString(), MongoDbResult.validResultHandler(either -> {
            if (either.isLeft()) {
                log.error("[Magneto@%s::fetchAllCards] Failed to get cards", this.getClass().getSimpleName(),
                        either.left().getValue());
                promise.fail(either.left().getValue());
            } else {
                JsonArray result = either.right().getValue()
                        .getJsonObject(Field.CURSOR, new JsonObject())
                        .getJsonArray(Field.FIRSTBATCH, new JsonArray());
                promise.complete(ModelHelper.toList(result, Card.class));
            }
        }));

        return promise.future();
    }

    private Future<JsonArray> fetchAllCardsCount(UserInfos user, String boardId, Integer page, boolean isPublic, boolean isShared, String searchText,
                                                 String sortBy, boolean getCount) {

        Promise<JsonArray> promise = Promise.promise();

        JsonObject query = this.getAllCardsQuery(user, boardId, page, isPublic, isShared, searchText, sortBy, getCount);

        mongoDb.command(query.toString(), MongoDbResult.validResultHandler(either -> {
            if (either.isLeft()) {
                log.error("[Magneto@%s::fetchAllCardsByCount] Failed to get cards with count", this.getClass().getSimpleName(),
                        either.left().getValue());
                promise.fail(either.left().getValue());
            } else {
                JsonArray result = either.right().getValue()
                        .getJsonObject(Field.CURSOR, new JsonObject())
                        .getJsonArray(Field.FIRSTBATCH, new JsonArray());
                promise.complete(result);
            }
        }));

        return promise.future();
    }

    private JsonObject getAllCardsQuery(UserInfos user, String boardId, Integer page, boolean isPublic, boolean isShared,
                                        String searchText, String sortBy, boolean getCount) {

        MongoQuery query = new MongoQuery(this.collection)
                .match(new JsonObject()
                        .put(Field.BOARDID, new JsonObject()
                                .put(Mongo.NE, boardId)))
                .lookUp(CollectionsConstant.BOARD_COLLECTION, Field.BOARDID, Field._ID, Field.RESULT)
                .matchRegex(searchText, Arrays.asList(Field.TITLE, Field.DESCRIPTION, Field.CAPTION,
                        String.format("%s.%s", Field.RESULT, Field.TAGS), String.format("%s.%s", Field.RESULT, Field.TITLE)));
        if (isShared) {
            query.matchOr(new JsonArray()
                    .add(new JsonObject()
                            .put(String.format("%s.%s.%s", Field.RESULT, Field.SHARED, Field.USERID),
                                    new JsonObject().put(Mongo.IN, new JsonArray().add(user.getUserId())))
                            .put(String.format("%s.%s.%s", Field.RESULT, Field.SHARED, "fr-cgi-magneto-controller-ShareBoardController|initContribRight"), true))
                    .add(new JsonObject()
                            .put(String.format("%s.%s.%s", Field.RESULT, Field.SHARED, Field.GROUPID),
                                    new JsonObject().put(Mongo.IN, user.getGroupsIds()))
                            .put(String.format("%s.%s.%s", Field.RESULT, Field.SHARED, "fr-cgi-magneto-controller-ShareBoardController|initContribRight"), true))
            );
        } else if (isPublic) {
            query.match(new JsonObject().put(String.format("%s.%s", Field.RESULT, Field.PUBLIC), true));
        } else {
            query.match(new JsonObject().put(String.format("%s.%s", Field.RESULT, Field.OWNERID), user.getUserId()));
        }
        List<String> groupField = Arrays.asList(Field.TITLE, Field.DESCRIPTION, Field.CAPTION, Field.RESOURCEID, Field.RESOURCETYPE, Field.RESOURCEURL);
        List<String> externalGroupField = Arrays.asList(Field.PARENTID, Field._ID, Field.CREATIONDATE, Field.BOARDID,
                Field.MODIFICATIONDATE, Field.OWNERID, Field.OWNERNAME, Field.LASTMODIFIERID, Field.LASTMODIFIERNAME, Field.RESULT);
        query
                .match(new JsonObject().put(String.format("%s.%s", Field.RESULT, Field.DELETED), false))
                .sort(Field.PARENTID, 1)
                .group(groupField, externalGroupField)
                .sort(String.format("%s.%s", Field.RESULT, Field.MODIFICATIONDATE), -1);

        if (getCount) {
            query = query.count();
        } else {
            query
                    .page(page)
                    .project(new JsonObject()
                            .put(Field._ID, String.format("$%s", Field.ID))
                            .put(Field.TITLE, String.format("$%s.%s", Field._ID, Field.TITLE))
                            .put(Field.CAPTION, String.format("$%s.%s", Field._ID, Field.CAPTION))
                            .put(Field.DESCRIPTION, String.format("$%s.%s", Field._ID, Field.DESCRIPTION))
                            .put(Field.RESOURCETYPE, String.format("$%s.%s", Field._ID, Field.RESOURCETYPE))
                            .put(Field.RESOURCEID, String.format("$%s.%s", Field._ID, Field.RESOURCEID))
                            .put(Field.RESOURCEURL, String.format("$%s.%s", Field._ID, Field.RESOURCEURL))
                            .put(Field.CREATIONDATE, 1)
                            .put(Field.MODIFICATIONDATE, 1)
                            .put(Field.OWNERID, 1)
                            .put(Field.OWNERNAME, 1)
                            .put(Field.LASTMODIFIERID, 1)
                            .put(Field.LASTMODIFIERNAME, 1)
                            .put(Field.BOARDTITLE, query.arrayElemAt(String.format("%s.%s", Field.RESULT, Field.TITLE), 0))
                            .put(Field.BOARDID, 1));
        }
        return query.getAggregate();
    }

    private JsonObject getAllCardsByBoardQuery(UserInfos user, Board board, boolean isSection, Integer page, boolean getCount) {
        JsonArray cardIds = new JsonArray(board.cards().stream().map(Card::getId).collect(Collectors.toList()));
        MongoQuery query = new MongoQuery(this.collection)
                .match(new JsonObject().put(Field.BOARDID, board.getId()))
                .match(new JsonObject().put(Field._ID, new JsonObject().put(Mongo.IN, cardIds)))
                .addFields(Field.INDEX, new JsonObject()
                        .put(Mongo.INDEX_OF_ARRAY, new JsonArray()
                                .add(cardIds)
                                .add('$' + Field._ID)
                        )
                )
                .sort(Field.INDEX, 1);
        if (getCount) {
            query.count();
        } else {
            if (page != null)
                query.page(page);
            query.project(new JsonObject()
                    .put(Field._ID, 1)
                    .put(Field.TITLE, 1)
                    .put(Field.CAPTION, 1)
                    .put(Field.DESCRIPTION, 1)
                    .put(Field.OWNERID, 1)
                    .put(Field.OWNERNAME, 1)
                    .put(Field.RESOURCETYPE, 1)
                    .put(Field.RESOURCEID, 1)
                    .put(Field.RESOURCEURL, 1)
                    .put(Field.CREATIONDATE, 1)
                    .put(Field.MODIFICATIONDATE, 1)
                    .put(Field.BOARDID, 1)
                    .put(Field.PARENTID, 1)
                    .put(Field.LASTMODIFIERID, 1)
                    .put(Field.LASTMODIFIERNAME, 1));
        }

        return query.getAggregate();
    }
}
