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
    private ServiceFactory serviceFactory;

    @Before
    public void setUp() {
        vertx = Vertx.vertx();
        MongoDb.getInstance().init(vertx.eventBus(), "fr.cgi.magneto");
        this.serviceFactory = new ServiceFactory(vertx, null, null, null, null, mongoDb);
        this.boardService = new DefaultBoardService("board", mongoDb, serviceFactory);
    }

    @Test
    public void testGetAllBoardsQuery(TestContext ctx) throws Exception {
       JsonObject expected = new JsonObject("{\n" +
               "\"aggregate\": \"board\",\n" +
               "\"allowDiskUse\": true,\n" +
               "\"cursor\": {\n" +
                    "\"batchSize\": 2147483647\n" +
               "},\n" +
               "\"pipeline\": [\n" +
                "{\n" +
               "      \"$match\": {\n" +
               "        \"deleted\": false,\n" +
               "        \"public\": false\n" +
               "      }\n" +
               "    },\n" +
               "    {\n" +
               "      \"$match\": {\n" +
               "        \"$or\": [\n" +
               "          {\n" +
               "            \"ownerId\": \"ownerId\"\n" +
               "          },\n" +
               "          {\n" +
               "            \"shared.userId\": {\n" +
               "              \"$in\": [\n" +
               "                \"ownerId\"\n" +
               "              ]\n" +
               "            }\n" +
               "          },\n" +
               "          {\n" +
               "            \"shared.groupId\": {\n" +
               "              \"$in\": null\n" +
               "            }\n" +
               "          }\n" +
               "        ]\n" +
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
               "      \"$lookup\": {\n" +
               "        \"from\": \"magneto.folders\",\n" +
               "        \"localField\": \"_id\",\n" +
               "        \"foreignField\": \"boardIds\",\n" +
               "        \"as\": \"folders\"\n" +
               "      }\n" +
               "    },\n" +
               "    {\n" +
               "      \"$match\": {\n" +
               "        \"folderId._id\": \"folderId\"\n" +
               "      }\n" +
               "    },\n" +
               "    {\n" +
               "      \"$project\": {\n" +
               "        \"_id\": 1,\n" +
               "        \"title\": 1,\n" +
               "        \"imageUrl\": 1,\n" +
               "        \"nbCards\": 1,\n" +
               "        \"modificationDate\": 1,\n" +
               "        \"folderId\": \"$folderId._id\",\n" +
               "        \"description\": 1,\n" +
               "        \"ownerId\": 1,\n" +
               "        \"ownerName\": 1,\n" +
               "        \"shared\": 1\n" +
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
    }



}
