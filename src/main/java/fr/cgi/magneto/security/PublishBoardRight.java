package fr.cgi.magneto.security;

import fr.cgi.magneto.core.constants.*;
import fr.cgi.magneto.helper.*;
import fr.wseduc.webutils.http.*;
import io.vertx.core.*;
import io.vertx.core.http.*;
import org.entcore.common.http.filter.*;
import org.entcore.common.user.*;

public class PublishBoardRight implements ResourcesProvider {
    @Override
    public void authorize(HttpServerRequest request, Binding binding, UserInfos user,
                          Handler<Boolean> handler) {
        handler.handle(WorkflowHelper.hasRight(user, Rights.PUBLISH_BOARD));
    }
}

