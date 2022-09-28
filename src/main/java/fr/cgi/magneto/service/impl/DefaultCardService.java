package fr.cgi.magneto.service.impl;

import com.mongodb.QueryBuilder;
import fr.cgi.magneto.Magneto;
import fr.cgi.magneto.core.constants.Collections;
import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.core.constants.Mongo;
import fr.cgi.magneto.model.MongoQuery;
import fr.cgi.magneto.model.cards.CardPayload;
import fr.cgi.magneto.service.CardService;
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

import java.util.Arrays;
import java.util.List;

public class DefaultCardService implements CardService {

    private final MongoDb mongoDb;
    private final String collection;
    protected static final Logger log = LoggerFactory.getLogger(DefaultCardService.class);


    public DefaultCardService(String collection, MongoDb mongo) {
        this.collection = collection;
        this.mongoDb = mongo;
    }

    @Override
    public Future<JsonObject> create(UserInfos user, CardPayload card) {
        Promise<JsonObject> promise = Promise.promise();
        card.setOwnerId(user.getUserId());
        card.setOwnerName(user.getFirstName() + " " + user.getLastName());
        mongoDb.insert(this.collection, card.toJson(), MongoDbResult.validResultHandler(results -> {
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
    public Future<JsonObject> getLastCard(UserInfos user, CardPayload card) {
        Promise<JsonObject> promise = Promise.promise();
        QueryBuilder matcher = QueryBuilder.start(Field.OWNERID).is(user.getUserId())
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
    public Future<JsonObject> getAllCards(UserInfos user, Integer page, boolean isPublic, boolean isShared, String searchText, String sortBy) {
        Promise<JsonObject> promise = Promise.promise();


        Future<JsonArray> fetchAllCardsCountFuture = fetchAllCards(user, page, isPublic, isShared, searchText, sortBy, true);

        Future<JsonArray> fetchAllCardsFuture = fetchAllCards(user, page, isPublic, isShared, searchText, sortBy, false);


        CompositeFuture.all(fetchAllCardsFuture, fetchAllCardsCountFuture)
                .onFailure(fail -> {
                    log.error("[Magneto@%s::getAllCards] Failed to get cards", this.getClass().getSimpleName(),
                            fail.getMessage());
                    promise.fail(fail.getMessage());
                })
                .onSuccess(success -> {
                    JsonArray cards = fetchAllCardsFuture.result();
                    int cardsCount = (fetchAllCardsCountFuture.result().isEmpty()) ? 0 :
                            fetchAllCardsCountFuture.result().getJsonObject(0).getInteger(Field.COUNT);
                    promise.complete(new JsonObject()
                            .put(Field.ALL, cards)
                            .put(Field.COUNT, cardsCount)
                            .put(Field.PAGECOUNT, cardsCount <= Magneto.PAGE_SIZE ?
                                    0 : (long) Math.ceil(cardsCount / (double) Magneto.PAGE_SIZE)));
                });
        return promise.future();
    }

    @Override
    public Future<JsonObject> getCard(String cardId) {
        Promise<JsonObject> promise = Promise.promise();
        QueryBuilder matcher = QueryBuilder.start(Field._ID).is(cardId);
        mongoDb.findOne(this.collection, MongoQueryBuilder.build(matcher), MongoDbResult.validResultHandler(results -> {
            if (results.isLeft()) {
                String message = String.format("[Magneto@%s::getCard] Failed to get card", this.getClass().getSimpleName());
                log.error(String.format("%s. %s", message, results.left().getValue()));
                promise.fail(message);
                return;
            }
            promise.complete(results.right().getValue());
        }));
        return promise.future();
    }

    @Override
    public Future<JsonObject> getAllCardsByBoard(UserInfos user, String boardId, Integer page, boolean isSection) {
        Promise<JsonObject> promise = Promise.promise();

        Future<JsonArray> fetchAllCardsCountFuture = fetchAllCardsByBoard(user, boardId, isSection, page, true);

        Future<JsonArray> fetchAllCardsFuture = fetchAllCardsByBoard(user, boardId, isSection, page, false);


        CompositeFuture.all(fetchAllCardsFuture, fetchAllCardsCountFuture)
                .onFailure(fail -> {
                    log.error("[Magneto@%s::getAllCardsByBoard] Failed to get cards", this.getClass().getSimpleName(),
                            fail.getMessage());
                    promise.fail(fail.getMessage());
                })
                .onSuccess(success -> {
                    JsonArray cards = fetchAllCardsFuture.result();
                    int cardsCount = (fetchAllCardsCountFuture.result().isEmpty()) ? 0 :
                            fetchAllCardsCountFuture.result().getJsonObject(0).getInteger(Field.COUNT);
                    promise.complete(new JsonObject()
                            .put(Field.ALL, cards)
                            .put(Field.COUNT, cardsCount)
                            .put(Field.PAGECOUNT, cardsCount <= Magneto.PAGE_SIZE ?
                                    0 : (long) Math.ceil(cardsCount / (double) Magneto.PAGE_SIZE)));
                });
        return promise.future();
    }

    private Future<JsonArray> fetchAllCardsByBoard(UserInfos user, String boardId, boolean isSection, Integer page, boolean getCount) {
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

    private Future<JsonArray> fetchAllCards(UserInfos user, Integer page, boolean isPublic, boolean isShared, String searchText,
                                            String sortBy, boolean getCount) {

        Promise<JsonArray> promise = Promise.promise();

        JsonObject query = this.getAllCardsQuery(user, page, isPublic, isShared, searchText, sortBy, getCount);

        mongoDb.command(query.toString(), MongoDbResult.validResultHandler(either -> {
            if (either.isLeft()) {
                log.error("[Magneto@%s::fetchAllCards] Failed to get cards", this.getClass().getSimpleName(),
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

    private JsonObject getAllCardsQuery(UserInfos user, Integer page, boolean isPublic, boolean isShared,
                                        String searchText, String sortBy, boolean getCount) {

        MongoQuery query = new MongoQuery(this.collection)
                .matchRegex(searchText, Arrays.asList(Field.TITLE, Field.DESCRIPTION, Field.CAPTION))
                .lookUp(Collections.BOARD_COLLECTION, Field.BOARDID, Field._ID, Field.RESULT);
        if (isPublic) {
            query.match(new JsonObject().put(Field.RESULT + "." + Field.PUBLIC, true));
        } else {
            query.match(new JsonObject().put(Field.RESULT + "." + Field.OWNERID, user.getUserId()));
        }
        query
                .match(new JsonObject().put(Field.RESULT + "." + Field.DELETED, false))
                .sort(Field.RESULT + "." + Field.MODIFICATIONDATE, -1)
                .sort(sortBy, -1);

        if (getCount) {
            query = query.count();
        } else {
            query
                    .page(page)
                    .project(new JsonObject()
                            .put(Field._ID, 1)
                            .put(Field.TITLE, 1)
                            .put(Field.CAPTION, 1)
                            .put(Field.DESCRIPTION, 1)
                            .put(Field.RESSOURCETYPE, 1)
                            .put(Field.RESSOURCEURL, 1)
                            .put(Field.CREATIONDATE, 1)
                            .put(Field.MODIFICATIONDATE, 1)
                            .put(Field.BOARDID, 1));
        }

        return query.getAggregate();
    }

    private JsonObject getAllCardsByBoardQuery(UserInfos user, String boardId, boolean isSection, Integer page, boolean getCount) {
        MongoQuery query = new MongoQuery(this.collection)
                .match(new JsonObject().put(Field.BOARDID, boardId))
                .lookUp(Collections.BOARD_COLLECTION, Field.BOARDID, Field._ID, Field.RESULT);
        if (getCount) {
            query.count();
        } else {
            query.page(page)
                    .project(new JsonObject()
                            .put(Field._ID, 1)
                            .put(Field.TITLE, 1)
                            .put(Field.CAPTION, 1)
                            .put(Field.DESCRIPTION, 1)
                            .put(Field.RESSOURCETYPE, 1)
                            .put(Field.RESSOURCEURL, 1)
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