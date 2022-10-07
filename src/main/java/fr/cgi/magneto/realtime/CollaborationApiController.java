package fr.cgi.magneto.realtime;

import io.vertx.core.json.Json;
import io.vertx.ext.web.RoutingContext;

import java.math.BigDecimal;
import java.util.Optional;

public class CollaborationApiController {

    private final CollaborationRepostiory repository;

    public CollaborationApiController(CollaborationRepostiory repository) {
        this.repository = repository;
    }

    public void handleGetAuction(RoutingContext context) {
        String auctionId = context.request().getParam("id");
        Optional<Collaboration> auction = this.repository.getById(auctionId);

        if (auction.isPresent()) {
            context.vertx().eventBus().publish("collaboration." + auctionId, Json.encodePrettily(auction.get()));
            context.response()
                .putHeader("content-type", "application/json")
                .setStatusCode(200)
                .end(Json.encodePrettily(auction.get()));
        } else {
            context.response()
                .putHeader("content-type", "application/json")
                .setStatusCode(404)
                .end();
        }
    }

    public void handleChangeAuctionPrice(RoutingContext context) {
        String auctionId = context.request().getParam("id");
        Collaboration auctionRequest = new Collaboration(
            auctionId,
            new BigDecimal(context.getBodyAsJson().getString("price"))
        );

        this.repository.save(auctionRequest);
        context.vertx().eventBus().publish("collaboration." + auctionId, context.getBodyAsString());

        context.response()
                .setStatusCode(200)
                .end();
    }

    public void initAuctionInSharedData(RoutingContext context) {
        String auctionId = context.request().getParam("id");

        Optional<Collaboration> auction = this.repository.getById(auctionId);
        if(!auction.isPresent()) {
            this.repository.save(new Collaboration(auctionId));
        }

        context.next();
    }
}
