package fr.cgi.magneto.realtime;

import io.vertx.core.shareddata.LocalMap;
import io.vertx.core.shareddata.SharedData;

import java.math.BigDecimal;
import java.util.Optional;

public class CollaborationRepostiory {

    private SharedData sharedData;

    public CollaborationRepostiory(SharedData sharedData) {
        this.sharedData = sharedData;
    }

    public Optional<Collaboration> getById(String auctionId) {
        LocalMap<String, String> auctionSharedData = this.sharedData.getLocalMap(auctionId);
        return Optional.of(auctionSharedData)
            .filter(m -> !m.isEmpty())
            .map(this::convertToAuction);
    }

    public void save(Collaboration auction) {
        LocalMap<String, String> auctionSharedData = this.sharedData.getLocalMap(auction.getId());

        auctionSharedData.put("id", auction.getId());
        auctionSharedData.put("price", auction.getPrice().toString());
    }

    private Collaboration convertToAuction(LocalMap<String, String> auction) {
        return new Collaboration(
            auction.get("id"),
            new BigDecimal(auction.get("price"))
        );
    }
}
