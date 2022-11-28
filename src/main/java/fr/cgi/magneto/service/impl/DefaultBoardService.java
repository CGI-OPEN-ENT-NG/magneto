package fr.cgi.magneto.service.impl;

import fr.cgi.magneto.Magneto;
import fr.cgi.magneto.core.constants.CollectionsConstant;
import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.core.constants.Mongo;
import fr.cgi.magneto.helper.ModelHelper;
import fr.cgi.magneto.model.MongoQuery;
import fr.cgi.magneto.model.boards.Board;
import fr.cgi.magneto.model.boards.BoardPayload;
import fr.cgi.magneto.service.BoardService;
import fr.cgi.magneto.service.FolderService;
import fr.cgi.magneto.service.ServiceFactory;
import fr.wseduc.mongodb.MongoDb;
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
import java.util.UUID;

public class DefaultBoardService implements BoardService {

    private final MongoDb mongoDb;
    private final String collection;
    private final FolderService folderService;
    protected static final Logger log = LoggerFactory.getLogger(DefaultBoardService.class);


    public DefaultBoardService(String collection, MongoDb mongo, ServiceFactory serviceFactory) {
        this.collection = collection;
        this.mongoDb = mongo;
        this.folderService = serviceFactory.folderService();
    }

    @Override
    public Future<JsonObject> create(UserInfos user, JsonObject board) {
        Promise<JsonObject> promise = Promise.promise();
        BoardPayload createBoard = new BoardPayload(board);
        String newId = UUID.randomUUID().toString();
        createBoard.setOwnerId(user.getUserId());
        createBoard.setOwnerName(user.getFirstName() + " " + user.getLastName());

        this.createBoard(createBoard, newId)
                .compose(success -> this.updateFolderOnBoardCreate(user.getUserId(), createBoard, newId))
                .onFailure(promise::fail)
                .onSuccess(res -> promise.complete(new JsonObject().put(Field.ID, newId)));
        return promise.future();
    }

    private Future<JsonObject> createBoard(BoardPayload board, String id) {
        Promise<JsonObject> promise = Promise.promise();
        JsonObject newBoard = board.toJson().put(Field._ID, id);
        mongoDb.insert(this.collection, newBoard, MongoDbResult.validResultHandler(results -> {
            if (results.isLeft()) {
                String message = String.format("[Magneto@%s::createBoard] Failed to create board", this.getClass().getSimpleName());
                log.error(String.format("%s. %s", message, results.left().getValue()));
                promise.fail(message);
                return;
            }
            promise.complete(results.right().getValue());
        }));
        return promise.future();
    }

    private Future<JsonObject> updateFolderOnBoardCreate(String ownerId, BoardPayload board, String boardId) {

        Promise<JsonObject> promise = Promise.promise();
        JsonObject query = new JsonObject()
                .put(Field._ID, board.getFolderId())
                .put(Field.OWNERID, ownerId);
        JsonObject update = new JsonObject()
                .put(Mongo.PUSH, new JsonObject()
                        .put(Field.BOARDIDS, boardId));
        mongoDb.update(CollectionsConstant.FOLDER_COLLECTION, query, update, MongoDbResult.validActionResultHandler(results -> {
            if (results.isLeft()) {
                String message = String.format("[Magneto@%s::updateFolderOnBoardCreate] " +
                        "Failed to update folder", this.getClass().getSimpleName());
                log.error(String.format("%s. %s", message, results.left().getValue()));
                promise.fail(message);
                return;
            }
            promise.complete(results.right().getValue());
        }));
        return promise.future();
    }

    @Override
    public Future<JsonObject> update(BoardPayload board) {
        Promise<JsonObject> promise = Promise.promise();
        JsonObject query = new JsonObject()
                .put(Field._ID, board.getId());
        JsonObject update = new JsonObject().put(Mongo.SET, board.toJson());
        mongoDb.update(this.collection, query, update, MongoDbResult.validActionResultHandler(results -> {
            if (results.isLeft()) {
                String message = String.format("[Magneto@%s::update] Failed to update board", this.getClass().getSimpleName());
                log.error(String.format("%s : %s", message, results.left().getValue()));
                promise.fail(message);
                return;
            }
            promise.complete(results.right().getValue().put(Field.CARDIDS, board.getCardIds()));
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

    @Override
    public Future<JsonObject> delete(String userId, List<String> boardIds) {
        Promise<JsonObject> promise = Promise.promise();
        this.deleteBoards(userId, boardIds)
                .compose(success -> this.folderService.updateOldFolder(boardIds))
                .onFailure(promise::fail)
                .onSuccess(promise::complete);

        return promise.future();
    }

    private Future<JsonObject> deleteBoards(String userId, List<String> boardIds) {
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
    public Future<List<Board>> getBoards(List<String> boardIds) {
        Promise<List<Board>> promise = Promise.promise();
        JsonObject query = this.getBoardByIds(boardIds);
        mongoDb.command(query.toString(), MongoDbResult.validResultHandler(either -> {
            if (either.isLeft()) {
                log.error("[Magneto@%s::getBoards] Failed to get boards", this.getClass().getSimpleName(),
                        either.left().getValue());
                promise.fail(either.left().getValue());
            } else {
                JsonArray result = either.right().getValue()
                        .getJsonObject(Field.CURSOR, new JsonObject())
                        .getJsonArray(Field.FIRSTBATCH, new JsonArray());
                promise.complete(ModelHelper.toList(result, Board.class));
            }
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
                            fetchAllBoardsCountFuture.result().getJsonObject(0).getInteger(Field.COUNT);
                    promise.complete(new JsonObject()
                            .put(Field.ALL, boards)
                            .put(Field.PAGE, boardsCount)
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
                        .getJsonObject(Field.CURSOR, new JsonObject())
                        .getJsonArray(Field.FIRSTBATCH, new JsonArray());
                promise.complete(result);
            }
        }));

        return promise.future();
    }

    private JsonObject getAllBoardsQuery(UserInfos user, Integer page,
                                         String searchText, String folderId,
                                         boolean isPublic, boolean isShared, boolean isDeleted,
                                         String sortBy, boolean getCount) {

        MongoQuery query = new MongoQuery(this.collection)
                .match(new JsonObject()
                        .put(Field.DELETED, isDeleted));

        if (isPublic) {
            query.match(new JsonObject()
                    .put(Field.PUBLIC, true));
        } else {
            if (isShared) {
                query.matchOr(new JsonArray()
                        .add(new JsonObject().put(Field.OWNERID, user.getUserId()))
                        .add(new JsonObject()
                                .put(String.format("%s.%s", Field.SHARED, Field.USERID), new JsonObject().put(Mongo.IN,
                                        new JsonArray().add(user.getUserId()))))
                        .add(new JsonObject()
                                .put(String.format("%s.%s", Field.SHARED, Field.GROUPID), new JsonObject().put(Mongo.IN, user.getGroupsIds()))));
            } else {
                query.match(new JsonObject().put(Field.OWNERID, user.getUserId()));
            }
        }

        query.matchRegex(searchText, Arrays.asList(Field.TITLE, Field.DESCRIPTION, Field.TAGS))
                .sort(sortBy, -1)
                .lookUp(CollectionsConstant.FOLDER_COLLECTION, Field._ID, Field.BOARDIDS, Field.FOLDERS);


        if (!getCount) {
            if (page != null) {
                query.page(page);
            }
            query.project(new JsonObject()
                            .put(Field._ID, 1)
                            .put(Field.TITLE, 1)
                            .put(Field.IMAGEURL, 1)
                            .put(Field.NBCARDS, new JsonObject().put(Mongo.SIZE, String.format("$%s", Field.CARDIDS)))
                            .put(Field.MODIFICATIONDATE, 1)
                            .put(Field.FOLDERID, new JsonObject().put(Mongo.FILTER,
                                    new JsonObject()
                                            .put(Mongo.INPUT, String.format("$%s", Field.FOLDERS))
                                            .put(Mongo.AS, Field.FOLDER)
                                            .put(Mongo.COND,
                                                    new JsonObject().put(Mongo.AND, new JsonArray()
                                                            .add(new JsonObject().put(Mongo.EQ, new JsonArray()
                                                                    .add(String.format("$$%s.%s", Field.FOLDER, Field.OWNERID))
                                                                    .add(user.getUserId())))
                                                            .add(new JsonObject().put(Mongo.EQ, new JsonArray()
                                                                    .add(String.format("$$%s.%s", Field.FOLDER, Field.DELETED))
                                                                    .add(String.format("$%s", Field.DELETED))))))
                            ))
                            .put(Field.DESCRIPTION, 1)
                            .put(Field.OWNERID, 1)
                            .put(Field.OWNERNAME, 1)
                            .put(Field.SHARED, 1)
                            .put(Field.TAGS, 1)
                            .put(Field.PUBLIC, 1)
                            .put(Field.DELETED, 1))
                    .unwind(Field.FOLDERID, true);
        }

        // If user searches a term, remove folder filter
        if (searchText == null || searchText.isEmpty()) {
            if (folderId != null || isDeleted) {
                query.match(new JsonObject().put(String.format("%s.%s", Field.FOLDERID, Field._ID), folderId));
            } else {
                query.match(new JsonObject().putNull(String.format("%s.%s", Field.FOLDERID, Field._ID)));
            }
        }

        query.project(new JsonObject()
                .put(Field._ID, 1)
                .put(Field.TITLE, 1)
                .put(Field.IMAGEURL, 1)
                .put(Field.NBCARDS, 1)
                .put(Field.MODIFICATIONDATE, 1)
                .put(Field.FOLDERID, String.format("$%s.%s", Field.FOLDERID, Field._ID))
                .put(Field.DESCRIPTION, 1)
                .put(Field.OWNERID, 1)
                .put(Field.OWNERNAME, 1)
                .put(Field.SHARED, 1)
                .put(Field.TAGS, 1)
                .put(Field.PUBLIC, 1));
        if (getCount) {
            query = query.count();
        }

        return query.getAggregate();
    }

    private JsonObject getBoardByIds(List<String> boardIds) {
        MongoQuery query = new MongoQuery(this.collection)
                .match(new JsonObject()
                        .put(Field._ID, new JsonObject().put(Mongo.IN, new JsonArray(boardIds))))
                .project(new JsonObject()
                        .put(Field._ID, 1)
                        .put(Field.TITLE, 1)
                        .put(Field.IMAGEURL, 1)
                        .put(Field.CREATIONDATE, 1)
                        .put(Field.CARDIDS, 1)
                        .put(Field.MODIFICATIONDATE, 1)
                        .put(Field.DESCRIPTION, 1)
                        .put(Field.OWNERID, 1)
                        .put(Field.OWNERNAME, 1)
                        .put(Field.SHARED, 1)
                        .put(Field.TAGS, 1)
                        .put(Field.PUBLIC, 1));
        return query.getAggregate();
    }
}
