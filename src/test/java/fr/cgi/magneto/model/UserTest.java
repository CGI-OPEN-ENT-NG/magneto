package fr.cgi.magneto.model;

import fr.cgi.magneto.model.user.User;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import org.junit.Test;
import org.junit.runner.RunWith;

@RunWith(VertxUnitRunner.class)
public class UserTest {

    JsonObject userJsonObject = new JsonObject()
            .put("id", "id")
            .put("username", "username");

    @Test
    public void testCardHasBeenInstantiated(TestContext ctx) {
        User user = new User(userJsonObject);
        ctx.assertEquals(userJsonObject, user.toJson());
    }

    @Test
    public void testCardHasContentWithObject(TestContext ctx) {
        User user = new User(userJsonObject);
        boolean isNotEmpty = !user.getUserId().isEmpty()
                && !user.getUsername().isEmpty();
        ctx.assertTrue(isNotEmpty);
    }


}
