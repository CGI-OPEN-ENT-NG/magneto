package fr.cgi.magneto.model;

import io.vertx.core.json.*;
import io.vertx.ext.unit.*;
import io.vertx.ext.unit.junit.*;
import org.junit.*;
import org.junit.runner.*;

import java.util.*;

@RunWith(VertxUnitRunner.class)
public class MongoQueryTest {
    JsonObject mongoQueryObject_1 = new JsonObject("{\n" +
            "  \"aggregate\": \"collection\",\n" +
            "  \"allowDiskUse\": true,\n" +
            "  \"cursor\": {\n" +
            "    \"batchSize\": 2147483647\n" +
            "  },\n" +
            "  \"pipeline\": [\n" +
            "    {\n" +
            "      \"$match\": {\n" +
            "        \"field\": \"value\"\n" +
            "      }\n" +
            "    },\n" +
            "    {\n" +
            "      \"$match\": {\n" +
            "        \"$or\": [\n" +
            "          {\n" +
            "            \"field1\": {\n" +
            "              \"$regex\": \"regex\"\n" +
            "            }\n" +
            "          },\n" +
            "          {\n" +
            "            \"field2\": {\n" +
            "              \"$regex\": \"regex\"\n" +
            "            }\n" +
            "          }\n" +
            "        ]\n" +
            "      }\n" +
            "    },\n" +
            "    {\n" +
            "      \"$match\": {\n" +
            "        \"$or\": [\n" +
            "          {\n" +
            "            \"field\": \"value\"\n" +
            "          }\n" +
            "        ]\n" +
            "      }\n" +
            "    },\n" +
            "    {\n" +
            "      \"$sort\": {\n" +
            "        \"field\": 1\n" +
            "      }\n" +
            "    },\n" +
            "    {\n" +
            "      \"$project\": {\n" +
            "        \"field\": 1\n" +
            "      }\n" +
            "    }\n" +
            "  ]\n" +
            "}");

    @Test
    public void testMongoQueryHasContentWithObject(TestContext ctx) {
        MongoQuery mongoQuery = new MongoQuery("collection")
                .match(new JsonObject().put("field", "value"))
                .matchRegex("regex", Arrays.asList("field1", "field2"))
                .matchOr(new JsonArray().add(new JsonObject().put("field", "value")))
                .sort("field", 1)
                .project(new JsonObject().put("field", 1));
        boolean isNotEmpty = mongoQuery.getAggregate().getJsonArray("pipeline").size() > 0 &&
                mongoQuery.getAggregate().getString("aggregate") != null &&
                mongoQuery.getAggregate().getJsonObject("cursor") != null &&
                mongoQuery.getAggregate().getBoolean("allowDiskUse") != null;
        ctx.assertTrue(isNotEmpty);
    }

    @Test
    public void testMongoQueryHasBeenInstanciated(TestContext ctx) {
        MongoQuery mongoQuery = new MongoQuery("collection")
                .match(new JsonObject().put("field", "value"))
                .matchRegex("regex", Arrays.asList("field1", "field2"))
                .matchOr(new JsonArray().add(new JsonObject().put("field", "value")))
                .sort("field", 1)
                .project(new JsonObject().put("field", 1));
        ctx.assertEquals(mongoQueryObject_1, mongoQuery.getAggregate());
    }

}
