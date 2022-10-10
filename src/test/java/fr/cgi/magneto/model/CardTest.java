package fr.cgi.magneto.model;

import fr.cgi.magneto.model.cards.*;
import io.vertx.core.json.*;
import io.vertx.ext.unit.*;
import io.vertx.ext.unit.junit.*;
import org.junit.*;
import org.junit.runner.*;

@RunWith(VertxUnitRunner.class)
public class CardTest {

    JsonObject cardJsonObject = new JsonObject()
            .put("title", "title")
            .put("resourceId", "resourceId")
            .put("resourceType", "resourceType")
            .put("resourceUrl", "resourceUrl")
            .put("description", "description")
            .put("lastModifierName", "lastModifierName")
            .put("lastModifierId", "lastModifierId")
            .put("modificationDate", "modificationDate")
            .put("caption", "caption");

    @Test
    public void testCardHasBeenInstantiated(TestContext ctx) {
        Card card = new Card(cardJsonObject);
        card.setId("id");
        card.setModificationDate("modificationDate");
        ctx.assertEquals(cardJsonObject, card.toJson());
    }

    @Test
    public void testCardHasContentWithObject(TestContext ctx) {
        Card card = new Card(cardJsonObject);
        boolean isNotEmpty =
                !card.getTitle().isEmpty() &&
                !card.getResourceId().isEmpty() &&
                !card.getResourceType().isEmpty() &&
                !card.getResourceUrl().isEmpty() &&
                !card.getDescription().isEmpty() &&
                !card.getLastModifierName().isEmpty() &&
                !card.getLastModifierId().isEmpty() &&
                !card.getModificationDate().isEmpty() &&
                !card.getCaption().isEmpty();
        ctx.assertTrue(isNotEmpty);
    }


}
