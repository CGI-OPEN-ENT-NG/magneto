package fr.cgi.magneto.model;

import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import java.util.List;
import java.util.stream.Collectors;

/**
 * ⚠ If you use this helper you must have the tests that go with it.
 * ⚠ These tests will make it possible to verify the correct implementation of all the classes that implement IModel.
 * ⚠ This will guarantee the correct execution of the line modelClass.getConstructor(JsonObject.class).newInstance(iModel).
 */

public interface Model<I extends Model<I>> {
    JsonObject toJson();

    I model(JsonObject model);

    @SuppressWarnings("unchecked")
    default List<I> toList(JsonArray results) {
        return ((List<JsonObject>) results.getList()).stream().map(this::model).collect(Collectors.toList());
    }

}