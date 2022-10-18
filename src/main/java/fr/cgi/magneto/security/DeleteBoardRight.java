package fr.cgi.magneto.security;

import fr.cgi.magneto.core.constants.*;
import fr.cgi.magneto.core.constants.Collections;
import fr.cgi.magneto.helper.*;
import fr.wseduc.webutils.http.*;
import io.vertx.core.*;
import io.vertx.core.http.*;
import io.vertx.core.json.*;
import org.entcore.common.http.filter.*;
import org.entcore.common.user.*;

import java.util.*;

public class DeleteBoardRight implements ResourcesProvider {
    @Override
    public void authorize(HttpServerRequest request, Binding binding, UserInfos user,
                          Handler<Boolean> handler) {

        List<String> boardIds = request.params().getAll(Field.BOARDIDS);

        JsonObject query = new JsonObject()
                .put(Field._ID, new JsonObject().put(Mongo.IN, new JsonArray(boardIds)))
                .put(Field.OWNERID, user.getUserId());

        MongoAppFilter.executeCountQuery(request, Collections.BOARD_COLLECTION, query, boardIds.size(), res -> {
            handler.handle(Boolean.TRUE.equals(res) && WorkflowHelper.hasRight(user, Rights.MANAGE_BOARD));
        });
    }
}
