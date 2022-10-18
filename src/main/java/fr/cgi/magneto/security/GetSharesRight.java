package fr.cgi.magneto.security;

import fr.wseduc.webutils.http.*;
import io.vertx.core.*;
import io.vertx.core.http.*;
import org.entcore.common.http.filter.*;
import org.entcore.common.user.*;

public class GetSharesRight implements ResourcesProvider {
    @Override
    public void authorize(HttpServerRequest request, Binding binding, UserInfos user,
                          Handler<Boolean> handler) {
        handler.handle(true);
    }
}
