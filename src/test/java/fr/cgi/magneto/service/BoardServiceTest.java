package fr.cgi.magneto.service;

import fr.cgi.magneto.service.impl.*;
import fr.wseduc.mongodb.*;
import io.vertx.core.*;
import io.vertx.core.json.*;
import io.vertx.ext.unit.*;
import io.vertx.ext.unit.junit.*;
import org.entcore.common.user.*;
import org.junit.*;
import org.junit.runner.*;
import org.mockito.*;
import org.powermock.reflect.*;

@RunWith(VertxUnitRunner.class)
public class BoardServiceTest {
    private Vertx vertx;
    MongoDb mongoDb = Mockito.mock(MongoDb.class);

    private BoardService boardService;

    @Before
    public void setUp() {
        vertx = Vertx.vertx();
        MongoDb.getInstance().init(vertx.eventBus(), "fr.cgi.magneto");
        this.boardService = new DefaultBoardService("board", mongoDb);
    }

    @Test
    public void testGetAllBoardsQuery(TestContext ctx) throws Exception {
       JsonObject expected = new JsonObject("{\n" +
               "  \"aggregate\": \"board\",\n" +
               "  \"allowDiskUse\": true,\n" +
               "  \"cursor\": {\n" +
               "    \"batchSize\": 2147483647\n" +
               "  },\n" +
               "  \"pipeline\": [\n" +
               "    {\n" +
               "      \"$match\": {\n" +
               "        \"deleted\": false,\n" +
               "        \"folderId\": \"folderId\",\n" +
               "        \"ownerId\": \"ownerId\",\n" +
               "        \"public\": false\n" +
               "      }\n" +
               "    },\n" +
               "    {\n" +
               "      \"$match\": {\n" +
               "        \"$or\": [\n" +
               "          {\n" +
               "            \"title\": {\n" +
               "              \"$regex\": \"test\",\n" +
               "              \"$options\": \"i\"\n" +
               "            }\n" +
               "          },\n" +
               "          {\n" +
               "            \"description\": {\n" +
               "              \"$regex\": \"test\",\n" +
               "              \"$options\": \"i\"\n" +
               "            }\n" +
               "          }\n" +
               "        ]\n" +
               "      }\n" +
               "    },\n" +
               "    {\n" +
               "      \"$sort\": {\n" +
               "        \"name\": -1\n" +
               "      }\n" +
               "    },\n" +
               "    {\n" +
               "      \"$count\": \"count\"\n" +
               "    }\n" +
               "  ]\n" +
               "}");

        JsonObject expectedDeleted = new JsonObject("{\n" +
                "  \"aggregate\": \"board\",\n" +
                "  \"allowDiskUse\": true,\n" +
                "  \"cursor\": {\n" +
                "    \"batchSize\": 2147483647\n" +
                "  },\n" +
                "  \"pipeline\": [\n" +
                "    {\n" +
                "      \"$match\": {\n" +
                "        \"deleted\": true,\n" +
                "        \"folderId\": \"folderId\",\n" +
                "        \"ownerId\": \"ownerId\",\n" +
                "        \"public\": false\n" +
                "      }\n" +
                "    },\n" +
                "    {\n" +
                "      \"$match\": {\n" +
                "        \"$or\": [\n" +
                "          {\n" +
                "            \"title\": {\n" +
                "              \"$regex\": \"test\",\n" +
                "              \"$options\": \"i\"\n" +
                "            }\n" +
                "          },\n" +
                "          {\n" +
                "            \"description\": {\n" +
                "              \"$regex\": \"test\",\n" +
                "              \"$options\": \"i\"\n" +
                "            }\n" +
                "          }\n" +
                "        ]\n" +
                "      }\n" +
                "    },\n" +
                "    {\n" +
                "      \"$sort\": {\n" +
                "        \"name\": -1\n" +
                "      }\n" +
                "    },\n" +
                "    {\n" +
                "      \"$count\": \"count\"\n" +
                "    }\n" +
                "  ]\n" +
                "}");

        UserInfos testUser = new UserInfos();
        testUser.setUserId("ownerId");

        JsonObject query = Whitebox.invokeMethod(this.boardService, "getAllBoardsQuery", testUser, 0, "test", "folderId",
                false, true, false, "name", true);

        ctx.assertEquals(expected, query);

        JsonObject query2 = Whitebox.invokeMethod(this.boardService, "getAllBoardsQuery", testUser, 0, "test", "folderId",
                false, true, true, "name", true);

        ctx.assertEquals(expectedDeleted, query2);
    }



}
