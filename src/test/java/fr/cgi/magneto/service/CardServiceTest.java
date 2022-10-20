package fr.cgi.magneto.service;

import fr.cgi.magneto.service.impl.DefaultCardService;
import fr.wseduc.mongodb.MongoDb;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import org.entcore.common.user.UserInfos;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mockito;
import org.powermock.reflect.Whitebox;

@RunWith(VertxUnitRunner.class)
public class CardServiceTest {
    private Vertx vertx;
    MongoDb mongoDb = Mockito.mock(MongoDb.class);

    private ServiceFactory serviceFactory;
    private CardService cardService;


    @Before
    public void setUp() {
        vertx = Vertx.vertx();
        MongoDb.getInstance().init(vertx.eventBus(), "fr.cgi.magneto");
        this.serviceFactory = new ServiceFactory(vertx, null, null, null, null, null);
        this.cardService = new DefaultCardService("card", mongoDb, serviceFactory);
    }

    @Test
    public void testGetAllCardsQuery(TestContext ctx) throws Exception {
        JsonObject expected = new JsonObject("{\n" +
                "   \"aggregate\":\"card\",\n" +
                "   \"allowDiskUse\":true,\n" +
                "   \"cursor\":{\n" +
                "      \"batchSize\":2147483647\n" +
                "   },\n" +
                "   \"pipeline\":[\n" +
                "      {\n" +
                "         \"$match\":{\n" +
                "            \"boardId\": {\"$ne\":\"boardId\"}\n" +
                "           }\n" +
                "      },\n" +
                "      {\n" +
                "         \"$lookup\":{\n" +
                "            \"from\":\"magneto.boards\",\n" +
                "            \"localField\":\"boardId\",\n" +
                "            \"foreignField\":\"_id\",\n" +
                "            \"as\":\"result\"\n" +
                "         }\n" +
                "      },\n" +
                "      {\n" +
                "         \"$match\":{\n" +
                "            \"$or\":[\n" +
                "               {\n" +
                "                  \"title\":{\n" +
                "                     \"$regex\":\"test\",\n" +
                "                     \"$options\":\"i\"\n" +
                "                  }\n" +
                "               },\n" +
                "               {\n" +
                "                  \"description\":{\n" +
                "                     \"$regex\":\"test\",\n" +
                "                     \"$options\":\"i\"\n" +
                "                  }\n" +
                "               },\n" +
                "               {\n" +
                "                  \"caption\":{\n" +
                "                     \"$regex\":\"test\",\n" +
                "                     \"$options\":\"i\"\n" +
                "                  }\n" +
                "               },\n" +
                "               {\n" +
                "                  \"result.tags\":{\n" +
                "                     \"$regex\":\"test\",\n" +
                "                     \"$options\":\"i\"\n" +
                "                  }\n" +
                "               }\n" +
                "            ]\n" +
                "         }\n" +
                "      },\n" +
                "      {\n" +
                "         \"$match\":{\n" +
                "            \"result.ownerId\":\"ownerId\"\n" +
                "         }\n" +
                "      },\n" +
                "      {\n" +
                "         \"$match\":{\n" +
                "            \"result.deleted\":false\n" +
                "         }\n" +
                "      },\n" +
                "      {\n" +
                "         \"$sort\":{\n" +
                "            \"result.modificationDate\":-1\n" +
                "         }\n" +
                "      },\n" +
                "      {\n" +
                "         \"$count\":\"count\"\n" +
                "      }\n" +
                "   ]\n" +
                "}");

        UserInfos testUser = new UserInfos();
        testUser.setUserId("ownerId");

        JsonObject query = Whitebox.invokeMethod(this.cardService, "getAllCardsQuery", testUser,
                "boardId", 0, false, false, "test", null, true);

        ctx.assertEquals(expected, query);

    }


}
