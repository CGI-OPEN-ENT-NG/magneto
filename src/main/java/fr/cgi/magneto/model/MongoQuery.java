package fr.cgi.magneto.model;

import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.core.constants.Mongo;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import java.util.List;

import static fr.cgi.magneto.Magneto.PAGE_SIZE;

public class MongoQuery {

    private final String collection;
    private JsonArray pipeline;

    public MongoQuery(String collection) {
        this.collection = collection;
        this.pipeline = new JsonArray();
    }


    public JsonObject getAggregate() {
        return new JsonObject()
                .put("aggregate", collection)
                .put("allowDiskUse", true)
                .put("cursor", new JsonObject().put("batchSize", Integer.MAX_VALUE))
                .put("pipeline", this.pipeline);
    }


    public MongoQuery match(JsonObject parameters) {
        this.pipeline.add(new JsonObject()
                .put(Mongo.MATCH, parameters));
        return this;
    }

    public JsonObject arrayElemAt(String field, int index) {
        return new JsonObject()
                .put(Mongo.ARRAYELEMAT, new JsonArray()
                        .add(String.format("$%s", field))
                        .add(index));
    }


    public MongoQuery graphLookup(JsonObject parameters) {
        this.pipeline.add(new JsonObject()
                .put(Mongo.GRAPHLOOKUP, parameters));
        return this;
    }

    public MongoQuery matchRegex(String regex, List<String> parameters) {
        JsonArray or = new JsonArray();
        parameters.forEach(param -> or.add(new JsonObject().put(param,
                new JsonObject()
                        .put(Mongo.REGEX, regex)
                        .put(Mongo.OPTIONS, "i"))));
        this.pipeline.add(new JsonObject()
                .put(Mongo.MATCH, new JsonObject().put(Mongo.OR, or)));
        return this;
    }

    public MongoQuery matchOr(JsonArray parameters) {
        this.pipeline.add(new JsonObject()
                .put(Mongo.MATCH, new JsonObject().put(Mongo.OR, parameters)));
        return this;
    }

    public MongoQuery addFields(String field, JsonObject value) {
        this.pipeline.add(new JsonObject()
                .put(Mongo.ADD_FIELDS, new JsonObject().put(field, value)));
        return this;
    }

    public MongoQuery sort(String field, Integer sortOrder) {
        this.pipeline.add(new JsonObject()
                .put(Mongo.SORT, new JsonObject().put(field, sortOrder)));
        return this;
    }

    public MongoQuery group(List<String> fields, List<String> externalFields) {
        JsonObject group = new JsonObject().put(Mongo._ID, new JsonObject());
        fields.forEach(field -> group.getJsonObject(Mongo._ID).put(field, String.format("$%s", field)));
        if (!externalFields.isEmpty()) {
            externalFields.forEach(field -> {
                if(field.equals(Field._ID)) {
                    group.put(Field.ID, new JsonObject().put(Mongo.FIRST, String.format("$%s", field)));
                } else {
                    group.put(field, new JsonObject().put(Mongo.FIRST, String.format("$%s", field)));
                }
            });
        }
        this.pipeline.add(new JsonObject()
                .put(Mongo.GROUP, group));
        return this;
    }

    public MongoQuery project(JsonObject parameters) {
        this.pipeline.add(new JsonObject()
                .put(Mongo.PROJECT, parameters));
        return this;
    }

    public MongoQuery count() {
        this.pipeline.add(new JsonObject()
                .put(Mongo.COUNT, Field.COUNT));
        return this;
    }

    public MongoQuery page(Integer pageNumber) {
        if (pageNumber > 0) {
            this.pipeline.add(new JsonObject().put(Mongo.SKIP, pageNumber * PAGE_SIZE));
        }
        this.pipeline.add(new JsonObject().put(Mongo.LIMIT, PAGE_SIZE));
        return this;
    }

    public MongoQuery lookUp(String from, String localField, String foreignField, String output) {
        this.pipeline.add(new JsonObject()
                .put(Mongo.LOOKUP, new JsonObject()
                        .put(Mongo.FROM, from)
                        .put(Mongo.LOCALFIELD, localField)
                        .put(Mongo.FOREIGNFIELD, foreignField)
                        .put(Mongo.AS, output)));
        return this;
    }

    public MongoQuery unwind(String path, boolean empty) {
        this.pipeline.add(new JsonObject()
                .put(Mongo.UNWIND, new JsonObject()
                        .put(Mongo.PATH, String.format("$%s", path))
                        .put(Mongo.NULLOREMPTY, empty)));
        return this;
    }

}
