package fr.cgi.magneto.realtime;

import io.vertx.core.Handler;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import io.vertx.ext.bridge.BridgeEventType;
import io.vertx.ext.web.handler.sockjs.BridgeEvent;

public class RealTimeController implements Handler<BridgeEvent> {

    private static final Logger logger = LoggerFactory.getLogger(RealTimeController.class);

    private final EventBus eb;

    RealTimeController(EventBus eventBus) {
        this.eb = eventBus;
    }

    @Override
    public void handle(BridgeEvent event) {
        if (event.type() == BridgeEventType.SOCKET_CREATED)
            logger.info("A socket was created");

        if (event.type() == BridgeEventType.SEND)
            clientToServer(event.getRawMessage());

        event.complete(true);
    }

    private void clientToServer(JsonObject body) {
        logger.info("receiving info " + body.toString());
//        eventBus.publish("out", value);
    }
}