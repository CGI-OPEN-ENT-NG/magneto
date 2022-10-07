package fr.cgi.magneto.realtime;

import fr.cgi.magneto.config.MagnetoConfig;
import io.vertx.core.Vertx;
import io.vertx.core.http.HttpMethod;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import io.vertx.ext.bridge.PermittedOptions;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.handler.BodyHandler;
import io.vertx.ext.web.handler.CorsHandler;
import io.vertx.ext.web.handler.sockjs.SockJSBridgeOptions;
import io.vertx.ext.web.handler.sockjs.SockJSHandler;

public class RealTimeCollaboration {
	private static final Logger logger = LoggerFactory.getLogger(RealTimeCollaboration.class);

	private final CollaborationApiController collaborationApiController;
	private final Vertx vertx;
	private final Router router;
	private final MagnetoConfig magnetoConfig;


	public RealTimeCollaboration(Vertx vertx, MagnetoConfig magnetoConfig) {
		this.vertx = vertx;
		this.magnetoConfig = magnetoConfig;
		CollaborationRepostiory repository = new CollaborationRepostiory(this.vertx.sharedData());
		this.collaborationApiController = new CollaborationApiController(repository);
		this.router = Router.router(this.vertx);

		// TODO test to show we can publish any address via vertxEventBus -> no need to implement
		// this.router.mountSubRouter("/api", auctionApiRouter()); and all its stuff but use Controller instead
		// this.vertx.setPeriodic(5000, id -> vertx.eventBus().publish("collaboration.5", new JsonObject().put("test", "ok")));
	}

	public void initRealTime() {
		this.router.route().handler(CorsHandler.create(magnetoConfig.host())
				.allowedMethod(HttpMethod.GET)
				.allowedMethod(HttpMethod.POST)
				.allowedMethod(HttpMethod.OPTIONS)
				.allowedMethod(HttpMethod.PATCH)
				.allowedHeader("Access-Control-Request-Method")
				.allowedHeader("Access-Control-Allow-Credentials")
				.allowedHeader("Access-Control-Allow-Origin")
				.allowedHeader("Access-Control-Allow-Headers")
				.allowedHeader("Content-Type")
				.allowCredentials(true));


		SockJSBridgeOptions opts = getSockJSBridgeOptions();

		this.router.mountSubRouter(magnetoConfig.websocketConfig().endpointProxy(), SockJSHandler.create(this.vertx)
				.bridge(opts, new RealTimeController(this.vertx.eventBus())));
		this.router.mountSubRouter("/api", auctionApiRouter());

		this.vertx.createHttpServer().requestHandler(this.router).listen(magnetoConfig.websocketConfig().port());
	}

	private SockJSBridgeOptions getSockJSBridgeOptions() {
		return new SockJSBridgeOptions()
				.addOutboundPermitted(new PermittedOptions()
						.setAddressRegex("collaboration\\.[0-9]+"))
				.addInboundPermitted(new PermittedOptions()
						.setAddressRegex("collaboration\\.[0-9]+"));
	}

	private Router auctionApiRouter() {
		Router router = Router.router(vertx);
		router.route().handler(CorsHandler.create(magnetoConfig.host())
				.allowedMethod(HttpMethod.GET)
				.allowedMethod(HttpMethod.POST)
				.allowedMethod(HttpMethod.OPTIONS)
				.allowedMethod(HttpMethod.PATCH)
				.allowedHeader("Access-Control-Request-Method")
				.allowedHeader("Access-Control-Allow-Credentials")
				.allowedHeader("Access-Control-Allow-Origin")
				.allowedHeader("Access-Control-Allow-Headers")
				.allowedHeader("Content-Type")
				.allowCredentials(true));

		router.route().handler(BodyHandler.create());

		router.route().consumes("application/json");
		router.route().produces("application/json");

		router.route("/collaboration/:id").handler(collaborationApiController::initAuctionInSharedData);
		router.get("/collaboration/:id").handler(collaborationApiController::handleGetAuction);
		router.patch("/collaboration/:id").handler(collaborationApiController::handleChangeAuctionPrice);

		return router;
	}
}
