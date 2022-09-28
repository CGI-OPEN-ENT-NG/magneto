package fr.cgi.magneto.model;

import fr.cgi.magneto.core.constants.*;
import io.vertx.core.json.*;

import java.util.*;

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

    public MongoQuery sort(String field, Integer sortOrder) {
        this.pipeline.add(new JsonObject()
                .put(Mongo.SORT, new JsonObject().put(field, sortOrder)));
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
                        .put(Mongo.PATH, path)
                        .put(Mongo.NULLOREMPTY, empty)));
        return this;
    }

}
