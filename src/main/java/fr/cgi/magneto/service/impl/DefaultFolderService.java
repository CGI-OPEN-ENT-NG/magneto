package fr.cgi.magneto.service.impl;

import com.mongodb.*;
import fr.cgi.magneto.core.constants.*;
import fr.cgi.magneto.model.*;
import fr.cgi.magneto.service.*;
import fr.wseduc.mongodb.*;
import io.vertx.core.*;
import io.vertx.core.json.*;
import org.entcore.common.mongodb.*;
import org.entcore.common.user.*;

import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;

public class DefaultFolderService implements FolderService {

    public final MongoDb mongoDb;
    public final String collection;
    protected static final Logger log = LoggerFactory.getLogger(DefaultFolderService.class);

    public DefaultFolderService(String collection, MongoDb mongo) {
        this.collection = collection;
        this.mongoDb = mongo;
    }

    @Override
    public Future<JsonArray> getFolders(UserInfos user) {
        Promise<JsonArray> promise = Promise.promise();
        QueryBuilder matcher = QueryBuilder.start(Field.OWNERID).is(user.getUserId());
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
}
