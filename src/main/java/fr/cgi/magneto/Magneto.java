package fr.cgi.magneto;

import fr.cgi.magneto.config.MagnetoConfig;
import fr.cgi.magneto.controller.*;
import fr.cgi.magneto.realtime.RealTimeCollaboration;
import fr.cgi.magneto.service.ServiceFactory;
import fr.wseduc.mongodb.MongoDb;
import org.entcore.common.http.BaseServer;
import org.entcore.common.neo4j.Neo4j;
import org.entcore.common.sql.Sql;
import org.entcore.common.storage.Storage;
import org.entcore.common.storage.StorageFactory;

public class Magneto extends BaseServer {
	public static final Integer PAGE_SIZE = 20;

	@Override
	public void start() throws Exception {
		super.start();

		Storage storage = new StorageFactory(vertx, config).getStorage();
		MagnetoConfig magnetoConfig = new MagnetoConfig(config);
		ServiceFactory serviceFactory = new ServiceFactory(vertx, storage, magnetoConfig, Neo4j.getInstance(), Sql.getInstance(), MongoDb.getInstance());

		addController(new MagnetoController(serviceFactory));
		addController(new BoardController(serviceFactory));
		addController(new CardController(serviceFactory));
		addController(new FolderController(serviceFactory));

		// TODO Websocket
		// new RealTimeCollaboration(vertx, magnetoConfig).initRealTime();
	}
}
