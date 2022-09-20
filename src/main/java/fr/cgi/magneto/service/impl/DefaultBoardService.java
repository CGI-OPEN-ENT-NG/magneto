package fr.cgi.magneto.service.impl;

import fr.cgi.magneto.*;
import fr.cgi.magneto.core.constants.*;
import fr.cgi.magneto.model.*;
import fr.cgi.magneto.service.BoardService;
import io.vertx.core.*;
import io.vertx.core.json.*;
import fr.wseduc.mongodb.MongoDb;
import io.vertx.core.json.JsonObject;
import io.vertx.core.Promise;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.common.mongodb.MongoDbResult;
import org.entcore.common.user.UserInfos;

import java.util.*;

public class DefaultBoardService implements BoardService {

    private final MongoDb mongoDb;
    private final String collection;
    protected static final Logger log = LoggerFactory.getLogger(DefaultBoardService.class);


    public DefaultBoardService(String collection, MongoDb mongo) {
        this.collection = collection;
        this.mongoDb = mongo;
    }

    @Override
    public Future<JsonObject> create(UserInfos user, JsonObject board) {
        Promise<JsonObject> promise = Promise.promise();
        BoardPayload createBoard = new BoardPayload(board);
        createBoard.setOwnerId(user.getUserId());
        createBoard.setOwnerName(user.getFirstName() + " " + user.getLastName());
        mongoDb.insert(this.collection, createBoard.toJson(), MongoDbResult.validResultHandler(results -> {
            if (results.isLeft()) {
                String message = String.format("[Magneto@%s::create] Failed to create board", this.getClass().getSimpleName());
                log.error(String.format("%s. %s", message, results.left().getValue()));
                promise.fail(message);
                return;
            }
            promise.complete(results.right().getValue());
        }));
        return promise.future();
    }

    @Override
    public Future<JsonObject> update(UserInfos user, BoardPayload board) {
        Promise<JsonObject> promise = Promise.promise();
        JsonObject query = new JsonObject()
                .put(Field._ID, board.getId())
                .put(Field.OWNERID, user.getUserId());
        JsonObject update = new JsonObject().put(Mongo.SET, board.toJson());
        mongoDb.update(this.collection, query, update, MongoDbResult.validActionResultHandler(results -> {
            if (results.isLeft()) {
                String message = String.format("[Magneto@%s::update] Failed to update board", this.getClass().getSimpleName());
                log.error(String.format("%s : %s", message, results.left().getValue()));
                promise.fail(message);
                return;
            }
            promise.complete(results.right().getValue());
        }));
        return promise.future();
    }

    @Override
    public Future<JsonObject> preDeleteBoards(String userId, List<String> boardIds, boolean restore) {
        Promise<JsonObject> promise = Promise.promise();
        JsonObject query = new JsonObject()
                .put(Field._ID, new JsonObject().put(Mongo.IN, new JsonArray(boardIds)))
                .put(Field.OWNERID, userId);
        JsonObject update = new JsonObject().put(Mongo.SET, new JsonObject().put(Field.DELETED, !restore));
        mongoDb.update(this.collection, query, update, false, true, MongoDbResult.validActionResultHandler(results -> {
            if (results.isLeft()) {
                String message = String.format("[Magneto@%s::preDeleteBoards] Failed to pre delete boards",
                        this.getClass().getSimpleName());
                log.error(String.format("%s : %s", message, results.left().getValue()));
                promise.fail(message);
                return;
            }
            promise.complete(results.right().getValue());
        }));
        return promise.future();
    }

    public Future<JsonObject> deleteBoards(String userId, List<String> boardIds) {
        Promise<JsonObject> promise = Promise.promise();
        JsonObject query = new JsonObject()
                .put(Field._ID, new JsonObject().put(Mongo.IN, new JsonArray(boardIds)))
                .put(Field.OWNERID, userId);
        mongoDb.delete(this.collection, query, MongoDbResult.validActionResultHandler(results -> {
            if (results.isLeft()) {
                String message = String.format("[Magneto@%s::deleteBoards] Failed to delete boards",
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
    public Future<JsonObject> getAllBoards(UserInfos user, Integer page,
                                           String searchText, String folderId,
                                           boolean isPublic,
                                           boolean isShared, boolean isDeleted, String sortBy) {

        Promise<JsonObject> promise = Promise.promise();

        Future<JsonArray> fetchAllBoardsFuture = fetchAllBoards(user, page, searchText, folderId, isPublic, isShared,
                isDeleted, sortBy, false);

        Future<JsonArray> fetchAllBoardsCountFuture = fetchAllBoards(user, page, searchText, folderId,
                isPublic, isShared, isDeleted, sortBy, true);

        CompositeFuture.all(fetchAllBoardsFuture, fetchAllBoardsCountFuture)
                .onFailure(fail -> {
                    log.error("[Magneto@%s::getAllBoards] Failed to get boards", this.getClass().getSimpleName(),
                            fail.getMessage());
                    promise.fail(fail.getMessage());
                })
                .onSuccess(success -> {
                    JsonArray boards = fetchAllBoardsFuture.result();
                    int boardsCount = (fetchAllBoardsCountFuture.result().isEmpty()) ? 0 :
                            fetchAllBoardsCountFuture.result().getJsonObject(0).getInteger("count");
                    promise.complete(new JsonObject()
                            .put(Field.ALL, boards)
                            .put(Field.COUNT, boardsCount)
                            .put(Field.PAGECOUNT, boardsCount <= Magneto.PAGE_SIZE ?
                                    0 : (long) Math.ceil(boardsCount / (double) Magneto.PAGE_SIZE)));
                });
        return promise.future();
    }

    private Future<JsonArray> fetchAllBoards(UserInfos user, Integer page,
                                             String searchText, String folderId,
                                             boolean isPublic, boolean isShared, boolean isDeleted,
                                             String sortBy, boolean getCount) {

        Promise<JsonArray> promise = Promise.promise();

        JsonObject query = this.getAllBoardsQuery(user, page, searchText, folderId, isPublic, isShared,
                isDeleted, sortBy, getCount);

        mongoDb.command(query.toString(), MongoDbResult.validResultHandler(either -> {
            if (either.isLeft()) {
                log.error("[Magneto@%s::fetchAllBoards] Failed to get boards", this.getClass().getSimpleName(),
                        either.left().getValue());
                promise.fail(either.left().getValue());
            } else {
                JsonArray result = either.right().getValue()
                        .getJsonObject("cursor", new JsonObject())
                        .getJsonArray("firstBatch", new JsonArray());
                promise.complete(result);
            }
        }));

        return promise.future();
    }

    private JsonObject getAllBoardsQuery(UserInfos user, Integer page,
                                           String searchText, String folderId,
                                           boolean isPublic, boolean isShared, boolean isDeleted,
                                         String sortBy, boolean getCount) {

        //TODO: fetch shared boards (MAG-16)
        MongoQuery query = new MongoQuery(this.collection)
                .match(new JsonObject()
                        .put(Field.DELETED, isDeleted)
                        .put(Field.FOLDERID, folderId)
                        .put(Field.OWNERID, user.getUserId())
                        .put(Field.PUBLIC, isPublic))
                .matchRegex(searchText, Arrays.asList(Field.TITLE, Field.DESCRIPTION))
                .sort(sortBy, -1);

                if (!getCount)
                    query = query.page(page)

                .project(new JsonObject()
                        .put(Field._ID, 1)
                        .put(Field.TITLE, 1)
                        .put(Field.IMAGEURL, 1)
                        .put(Field.NBCARDS, new JsonObject().put(Mongo.SIZE, "$cardIds"))
                        .put(Field.MODIFICATIONDATE, 1)
                        .put(Field.FOLDERID, 1)
                        .put(Field.DESCRIPTION, 1));
                if (getCount) {
                    query = query.count();
                }

        return query.getAggregate();
    }

}
