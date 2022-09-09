package fr.cgi.magneto.model;

import fr.wseduc.mongodb.*;
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
                .put("$match", parameters));
        return this;
    }

    public MongoQuery matchRegex(String regex, List<String> parameters) {
        JsonArray or = new JsonArray();
        parameters.forEach(param -> or.add(new JsonObject().put(param, new JsonObject().put("$regex", regex))));
        this.pipeline.add(new JsonObject()
                .put("$match", new JsonObject().put("$or", or)));
        return this;
    }

    public MongoQuery matchOr(JsonArray parameters) {
        this.pipeline.add(new JsonObject()
                .put("$match", new JsonObject().put("$or", parameters)));
        return this;
    }

    public MongoQuery sort(String field, Integer sortOrder) {
        this.pipeline.add(new JsonObject()
                .put("$sort", new JsonObject().put(field, sortOrder)));
        return this;
    }

    public MongoQuery project(JsonObject parameters) {
        this.pipeline.add(new JsonObject()
                .put("$project",parameters));
        return this;
    }

    public MongoQuery count() {
        this.pipeline.add(new JsonObject()
                .put("$count", "count"));
        return this;
    }

    public MongoQuery page(Integer pageNumber) {
        if (pageNumber > 0) {
            this.pipeline.add(new JsonObject().put("$skip", pageNumber * PAGE_SIZE));
        }
        this.pipeline.add(new JsonObject().put("$limit", PAGE_SIZE));
        return this;
    }

}
