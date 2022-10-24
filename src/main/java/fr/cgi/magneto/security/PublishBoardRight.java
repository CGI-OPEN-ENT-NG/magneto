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

public class PublishBoardRight implements ResourcesProvider {
    @Override
    public void authorize(HttpServerRequest request, Binding binding, UserInfos user,
                          Handler<Boolean> handler) {
        String boardId = request.getParam(Field.ID);

        JsonObject query = new JsonObject()
                .put(Field._ID, boardId)
                .put(Field.DELETED, false)
                .put(Field.OWNERID, user.getUserId());

        MongoAppFilter.executeCountQuery(request, Collections.BOARD_COLLECTION, query, 1, res -> {
            handler.handle(Boolean.TRUE.equals(res) && WorkflowHelper.hasRight(user, Rights.PUBLISH_BOARD));
        });
    }
}

