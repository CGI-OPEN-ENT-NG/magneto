package fr.cgi.magneto.service;

import fr.cgi.magneto.core.constants.*;
import fr.cgi.magneto.service.impl.*;
import fr.wseduc.mongodb.MongoDb;
import io.vertx.core.Vertx;
import io.vertx.core.eventbus.EventBus;
import org.entcore.common.neo4j.Neo4j;
import org.entcore.common.sql.Sql;
import org.entcore.common.storage.Storage;

public class ServiceFactory {
    private final Vertx vertx;
    private final Storage storage;
    private final Neo4j neo4j;
    private final Sql sql;
    private final MongoDb mongoDb;

    public ServiceFactory(Vertx vertx, Storage storage, Neo4j neo4j, Sql sql, MongoDb mongoDb) {
        this.vertx = vertx;
        this.storage = storage;
        this.neo4j = neo4j;
        this.sql = sql;
        this.mongoDb = mongoDb;
    }

    public MagnetoService magnetoServiceExample() {
        return new DefaultMagnetoService();
    }

    public BoardService boardService() {
        return new DefaultBoardService(Collections.BOARD_COLLECTION, mongoDb);
    }

    public FolderService folderService() {
        return new DefaultFolderService(Collections.FOLDER_COLLECTION, mongoDb);
    }
    // Helpers
    public EventBus eventBus() {
        return this.vertx.eventBus();
    }

    public Vertx vertx() {
        return this.vertx;
    }
}
