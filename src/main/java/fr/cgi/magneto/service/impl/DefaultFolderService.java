package fr.cgi.magneto.service.impl;

import com.mongodb.QueryBuilder;
import fr.cgi.magneto.core.constants.CollectionsConstant;
import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.core.constants.Mongo;
import fr.cgi.magneto.helper.PromiseHelper;
import fr.cgi.magneto.model.FolderPayload;
import fr.cgi.magneto.model.MongoQuery;
import fr.cgi.magneto.service.FolderService;
import fr.wseduc.mongodb.MongoDb;
import fr.wseduc.mongodb.MongoQueryBuilder;
import io.vertx.core.Future;
import io.vertx.core.Promise;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.common.mongodb.MongoDbResult;
import org.entcore.common.user.UserInfos;

import java.util.List;
import java.util.stream.Collectors;

public class DefaultFolderService implements FolderService {

    public final MongoDb mongoDb;
    public final String collection;
    protected static final Logger log = LoggerFactory.getLogger(DefaultFolderService.class);

    public DefaultFolderService(String collection, MongoDb mongo) {
        this.collection = collection;
        this.mongoDb = mongo;
    }

    @Override
    public Future<JsonArray> getFolders(UserInfos user, boolean isDeleted) {
        Promise<JsonArray> promise = Promise.promise();
        QueryBuilder matcher = QueryBuilder.start(Field.OWNERID).is(user.getUserId());
        if (isDeleted) {
            matcher = matcher.and(Field.DELETED).is(true);
        } else {
            matcher = matcher.and(Field.DELETED).notEquals(true);
        }

        mongoDb.find(this.collection, MongoQueryBuilder.build(matcher), MongoDbResult.validResultsHandler(results -> {
            if (results.isLeft()) {
                String message = String.format("[Magneto@%s::getFolders] Failed to get folders", this.getClass().getSimpleName());
                log.error(String.format("%s : %s", message, results.left().getValue()));
                promise.fail(message);
                return;
            }
            promise.complete(results.right().getValue());
        }));
        return promise.future();
    }

    @Override
    public Future<JsonObject> createFolder(FolderPayload folder) {
        Promise<JsonObject> promise = Promise.promise();
        mongoDb.insert(this.collection, folder.toJson(), MongoDbResult.validResultHandler(results -> {
            if (results.isLeft()) {
                String message = String.format("[Magneto@%s::createFolder] Failed to create folder", this.getClass().getSimpleName());
                log.error(String.format("%s : %s", message, results.left().getValue()));
                promise.fail(message);
                return;
            }
            promise.complete();
        }));
        return promise.future();
    }

    @Override
    public Future<JsonObject> updateFolder(UserInfos user, FolderPayload folder) {
        Promise<JsonObject> promise = Promise.promise();
        JsonObject query = new JsonObject()
                .put(Field._ID, folder.getId())
                .put(Field.OWNERID, user.getUserId());
        JsonObject update = new JsonObject().put(Mongo.SET, folder.toJson());
        mongoDb.update(this.collection, query, update, MongoDbResult.validResultHandler(results -> {
            if (results.isLeft()) {
                String message = String.format("[Magneto@%s::updateFolder] Failed to update folder", this.getClass().getSimpleName());
                log.error(String.format("%s : %s", message, results.left().getValue()));
                promise.fail(message);
                return;
            }
            promise.complete();
        }));
        return promise.future();
    }

    @Override
    public Future<JsonObject> deleteFoldersAndBoards(UserInfos user, List<String> folderIds) {
        Promise<JsonObject> promise = Promise.promise();

        deleteBoardsInFolderWithChildren(folderIds, user.getUserId())
                .compose(v -> deleteFoldersWithChildren(folderIds, user.getUserId()))
                .onFailure(promise::fail)
                .onSuccess(promise::complete);

        return promise.future();
    }

    private Future<JsonObject> deleteFoldersWithChildren(List<String> folderIds, String ownerId) {
        Promise<JsonObject> promise = Promise.promise();
        this.getFolderChildrenIds(folderIds)
                .compose(childrenIds -> {
                    folderIds.addAll(childrenIds);
                    return this.deleteFolders(folderIds, ownerId);
                })
                .onFailure(promise::fail)
                .onSuccess(res -> promise.complete());
        return promise.future();
    }

    private Future<JsonObject> deleteFolders(List<String> folderIds, String ownerId) {
        Promise<JsonObject> promise = Promise.promise();

        JsonObject query = new JsonObject()
                .put(Field.OWNERID, ownerId)
                .put(Field._ID, new JsonObject().put(Mongo.IN, folderIds));
        mongoDb.delete(this.collection, query,
                MongoDbResult.validResultHandler(PromiseHelper.handler(promise,
                        String.format("[Magneto@%s::deleteFolders] Failed to delete folders",
                                this.getClass().getSimpleName()))));

        return promise.future();
    }

    private Future<JsonObject> deleteBoardsInFolderWithChildren(List<String> folderIds, String ownerId) {
        Promise<JsonObject> promise = Promise.promise();
        this.getFolderChildrenIds(folderIds)
                .compose(childrenIds -> {
                    folderIds.addAll(childrenIds);
                    return this.deleteBoardsInFolder(folderIds, ownerId);
                })
                .onFailure(promise::fail)
                .onSuccess(res -> promise.complete());
        return promise.future();
    }

    private Future<JsonObject> deleteBoardsInFolder(List<String> folderIds, String ownerId) {
        Promise<JsonObject> promise = Promise.promise();

        this.getBoardIdsInFolders(folderIds)
                .onFailure(promise::fail)
                .onSuccess(boardIds -> {
                    JsonObject query = new JsonObject()
                            .put(Field.OWNERID, ownerId)
                            .put(Field._ID, new JsonObject().put(Mongo.IN, boardIds));
                    mongoDb.delete(CollectionsConstant.BOARD_COLLECTION, query,
                            MongoDbResult.validResultHandler(PromiseHelper.handler(promise,
                                    String.format("[Magneto@%s::deleteBoardsInFolder] Failed to delete boards",
                                            this.getClass().getSimpleName()))));

                });
        return promise.future();
    }

    @SuppressWarnings("unchecked")
    private Future<List<String>> getBoardIdsInFolders(List<String> folderIds) {
        Promise<List<String>> promise = Promise.promise();
        JsonObject query = new MongoQuery(this.collection)
                .match(new JsonObject()
                        .put(Field._ID, new JsonObject().put(Mongo.IN, folderIds)))
                .project(new JsonObject().put(Field.BOARDIDS, 1))
                .getAggregate();

        mongoDb.command(query.toString(), MongoDbResult.validResultHandler(results -> {
            if (results.isLeft()) {
                String message = String.format("[Magneto@%s::getBoardIdsInFolders] Failed to get board ids in folders", this.getClass().getSimpleName());
                log.error(String.format("%s : %s", message, results.left().getValue()));
                promise.fail(message);
                return;
            }
            JsonArray result = results.right().getValue()
                    .getJsonObject(Mongo.CURSOR, new JsonObject())
                    .getJsonArray(Mongo.FIRSTBATCH, new JsonArray());

            List<String> boardIds = ((List<JsonObject>) result.getList()).stream().flatMap(r -> {
                List<String> bIds = (r.getJsonArray(Field.BOARDIDS, new JsonArray())).getList();
                return bIds.stream();
            }).collect(Collectors.toList());

            promise.complete(boardIds);
        }));


        return promise.future();
    }


    @Override
    public Future<JsonObject> preDeleteFoldersAndBoards(UserInfos user, List<String> folderIds, boolean restore) {
        Promise<JsonObject> promise = Promise.promise();

        this.preDeleteBoardsInFolderWithChildren(folderIds, restore, user.getUserId())
                .compose(v -> this.preDeleteFoldersWithChildren(folderIds, restore, user.getUserId()))
                .onFailure(promise::fail)
                .onSuccess(promise::complete);

        return promise.future();
    }

    private Future<JsonObject> preDeleteBoardsInFolderWithChildren(List<String> folderIds, boolean restore, String ownerId) {
        Promise<JsonObject> promise = Promise.promise();

        this.getFolderChildrenIds(folderIds)
                .compose(childrenIds -> {
                    folderIds.addAll(childrenIds);
                    return this.preDeleteBoardsInFolder(folderIds, restore, ownerId);
                })
                .onFailure(promise::fail)
                .onSuccess(promise::complete);

        return promise.future();
    }

    private Future<JsonObject> preDeleteBoardsInFolder(List<String> folderIds, boolean restore, String ownerId) {
        Promise<JsonObject> promise = Promise.promise();

        JsonObject query = new JsonObject()
                .put(Field.FOLDERID, new JsonObject().put(Mongo.IN, new JsonArray(folderIds)))
                .put(Field.OWNERID, ownerId);
        JsonObject update = new JsonObject().put(Mongo.SET, new JsonObject().put(Field.DELETED, !restore));
        mongoDb.update(CollectionsConstant.BOARD_COLLECTION, query, update, false, true,
                MongoDbResult.validResultHandler(PromiseHelper.handler(promise,
                        String.format("[Magneto@%s::preDeleteBoardsInFolder] Failed to pre-delete boards",
                                this.getClass().getSimpleName()))));

        return promise.future();
    }

    private Future<JsonObject> preDeleteFoldersWithChildren(List<String> folderIds, boolean restore, String ownerId) {
        Promise<JsonObject> promise = Promise.promise();

        this.getFolderChildrenIds(folderIds)
                .compose(childrenIds -> {
                    folderIds.addAll(childrenIds);
                    return this.preDeleteFolders(folderIds, restore, ownerId);
                })
                .onFailure(promise::fail)
                .onSuccess(promise::complete);
        return promise.future();
    }

    private Future<JsonObject> preDeleteFolders(List<String> folderIds, boolean restore, String ownerId) {
        Promise<JsonObject> promise = Promise.promise();

        JsonObject query = new JsonObject()
                .put(Field._ID, new JsonObject().put(Mongo.IN, new JsonArray(folderIds)))
                .put(Field.OWNERID, ownerId);
        JsonObject update = new JsonObject().put(Mongo.SET, new JsonObject().put(Field.DELETED, !restore));
        mongoDb.update(this.collection, query, update, false, true,
                MongoDbResult.validResultHandler(PromiseHelper.handler(promise,
                        String.format("[Magneto@%s::preDeleteFolders] Failed to pre-delete folders",
                                this.getClass().getSimpleName()))));
        return promise.future();
    }

    @SuppressWarnings("unchecked")
    private Future<List<String>> getFolderChildrenIds(List<String> folderIds) {

        Promise<List<String>> promise = Promise.promise();

        JsonObject query = new MongoQuery(this.collection)
                .match(new JsonObject()
                        .put(Field._ID, new JsonObject().put(Mongo.IN, folderIds)))
                .graphLookup(new JsonObject()
                        .put(Mongo.FROM, this.collection)
                        .put(Mongo.STARTWITH, String.format("$%s", Field._ID))
                        .put(Mongo.CONNECTFROMFIELD, Field._ID)
                        .put(Mongo.CONNECTTOFIELD, Field.PARENTID)
                        .put(Mongo.AS, Field.CHILDREN))
                .project(new JsonObject()
                        .put(Field.CHILDRENIDS, String.format("$%s.%s", Field.CHILDREN, Field._ID)))
                .getAggregate();


        mongoDb.command(query.toString(), MongoDbResult.validResultHandler(results -> {
            if (results.isLeft()) {
                String message = String.format("[Magneto@%s::getFolderChildrenIds] Failed to get folder children ids",
                        this.getClass().getSimpleName());
                log.error(String.format("%s : %s", message, results.left().getValue()));
                promise.fail(message);
                return;
            }

            JsonArray result = results.right().getValue()
                    .getJsonObject(Mongo.CURSOR, new JsonObject())
                    .getJsonArray(Mongo.FIRSTBATCH, new JsonArray());

            List<String> childrenFolderIds = ((List<JsonObject>) result.getList()).stream().flatMap(r -> {
                List<String> childrenIds = (r.getJsonArray(Field.CHILDRENIDS, new JsonArray())).getList();
                childrenIds.add(r.getString(Field._ID));
                return childrenIds.stream();
            }).collect(Collectors.toList());


            promise.complete(childrenFolderIds);
        }));

        return promise.future();
    }

    @Override
    public Future<JsonObject> moveBoardsToFolder(String userId, List<String> boardIds, String folderId) {
        Promise<JsonObject> promise = Promise.promise();

        this.updateOldFolder(boardIds)
                .compose(success -> this.updateNewFolder(userId, boardIds, folderId))
                .onFailure(promise::fail)
                .onSuccess(promise::complete);
        return promise.future();
    }

    private Future<JsonObject> updateNewFolder(String userId, List<String> boardIds, String folderId) {
        Promise<JsonObject> promise = Promise.promise();
        JsonObject query = new JsonObject()
                .put(Field._ID, folderId)
                .put(Field.OWNERID, userId);
        JsonObject update = new JsonObject().put(Mongo.PUSH,
                new JsonObject().put(Field.BOARDIDS, new JsonObject().put(Mongo.EACH, new JsonArray(boardIds))));
        mongoDb.update(this.collection, query, update, false, false,
                MongoDbResult.validActionResultHandler(results -> {
                    if (results.isLeft()) {
                        String message = String.format("[Magneto@%s::updateNewFolder] Failed to move boards to folder",
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
    public Future<JsonObject> updateOldFolder(List<String> boardIds) {
        Promise<JsonObject> promise = Promise.promise();
        JsonObject query = new JsonObject()
                .put(Field.BOARDIDS, new JsonObject().put(Mongo.ELEMMATCH, new JsonObject().put(Mongo.IN,
                        new JsonArray(java.util.Collections.singletonList(boardIds.get(0))))));

        JsonObject update = new JsonObject().put(Mongo.PULL, new JsonObject().put(Field.BOARDIDS,
                new JsonObject().put(Mongo.IN, new JsonArray(boardIds))));

        mongoDb.update(this.collection, query, update, false, false,
                MongoDbResult.validActionResultHandler(results -> {
                    if (results.isLeft()) {
                        String message = String.format("[Magneto@%s::updateOldFolder] Failed to update old folder",
                                this.getClass().getSimpleName());
                        log.error(String.format("%s : %s", message, results.left().getValue()));
                        promise.fail(message);
                        return;
                    }
                    promise.complete(results.right().getValue());
                }));

        return promise.future();
    }


}
