package fr.cgi.magneto.controller;

import fr.cgi.magneto.model.*;
import fr.cgi.magneto.security.*;
import fr.cgi.magneto.service.*;
import fr.wseduc.rs.*;
import fr.wseduc.security.*;
import fr.wseduc.webutils.request.*;
import io.vertx.core.http.*;
import org.entcore.common.controller.*;
import org.entcore.common.http.filter.*;
import org.entcore.common.user.*;

public class FolderController extends ControllerHelper {

    private final FolderService folderService;

    public FolderController(ServiceFactory serviceFactory) {
        this.folderService = serviceFactory.folderService();
    }

    @Get("/folders")
    @ApiDoc("Get user folders")
    @ResourceFilter(ViewRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void getFolders(HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, user ->
                folderService.getFolders(user)
                        .onSuccess(result -> renderJson(request, result))
                        .onFailure(fail -> {
                            String message = String.format("[Magneto@%s::getFolders] Failed to get user folders : %s",
                                    this.getClass().getSimpleName(), fail.getMessage());
                            log.error(message);
                            renderError(request);
                        }));
    }

    @Post("/folder")
    @ApiDoc("Create a folder")
    @ResourceFilter(ManageBoardRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void createFolder(HttpServerRequest request) {
        RequestUtils.bodyToJson(request, pathPrefix + "folder", folder ->
                UserUtils.getUserInfos(eb, request, user -> {
                    FolderPayload folderCreate = new FolderPayload(folder);
                    folderCreate.setOwnerId(user.getUserId());
                        folderService.createFolder(folderCreate)
                                .onFailure(err -> renderError(request))
                                .onSuccess(result -> renderJson(request, result));
                }));
    }

}
