package fr.cgi.magneto.model;

import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import java.util.List;
import java.util.stream.Collectors;

public interface Model<I extends Model<I>> {
    JsonObject toJson();

    I model(JsonObject model);

    @SuppressWarnings("unchecked")
    default List<I> toList(JsonArray results) {
        return ((List<JsonObject>) results.getList()).stream().map(this::model).collect(Collectors.toList());
    }

}