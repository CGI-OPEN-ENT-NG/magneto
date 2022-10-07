package fr.cgi.magneto.realtime;

import java.math.BigDecimal;

// TODO refactor
public class Collaboration {

    private final String id;
    private final BigDecimal price;

    public Collaboration(String id, BigDecimal price) {
        this.id = id;
        this.price = price;
    }

    public Collaboration(String auctionId) {
        this(auctionId, BigDecimal.ZERO);
    }

    public String getId() {
        return id;
    }

    public BigDecimal getPrice() {
        return price;
    }

    @Override
    public String toString() {
        return "Auction{" +
                "id='" + id + '\'' +
                ", price=" + price +
                '}';
    }
}
