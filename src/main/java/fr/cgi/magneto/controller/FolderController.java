package fr.cgi.magneto.controller;

import fr.cgi.magneto.core.constants.*;
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

import java.util.*;

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
        UserUtils.getUserInfos(eb, request, user -> {
            boolean isDeleted = Boolean.parseBoolean(request.getParam(Field.ISDELETED));
            folderService.getFolders(user, isDeleted)
                        .onSuccess(result -> renderJson(request, result))
                        .onFailure(fail -> {
                            String message = String.format("[Magneto@%s::getFolders] Failed to get user folders : %s",
                                    this.getClass().getSimpleName(), fail.getMessage());
                            log.error(message);
                            renderError(request);
                        });
        });
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

    @Put("/folder/:folderId")
    @ApiDoc("Update a folder")
    @ResourceFilter(ManageBoardRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void updateFolder(HttpServerRequest request) {
        RequestUtils.bodyToJson(request, pathPrefix + "folder", folder ->
                UserUtils.getUserInfos(eb, request, user -> {
                    String folderId = request.getParam(Field.FOLDERID);
                    FolderPayload folderPayload = new FolderPayload(folder).setId(folderId);
                    folderService.updateFolder(user, folderPayload)
                                .onFailure(err -> renderError(request))
                                .onSuccess(result -> renderJson(request, result));
                }));
    }


    @Delete("/folders")
    @ApiDoc("Delete folders")
    @ResourceFilter(ManageBoardRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @SuppressWarnings("unchecked")
    public void deleteFolders(HttpServerRequest request) {
        RequestUtils.bodyToJson(request, pathPrefix + "deleteFolder", folders ->
                UserUtils.getUserInfos(eb, request, user -> {
                    List<String> folderIds = folders.getJsonArray(Field.FOLDERIDS).getList();
                        folderService.deleteFoldersAndBoards(user, folderIds)
                                .onFailure(err -> renderError(request))
                                .onSuccess(result -> renderJson(request, result));
                }));
    }

    @Put("/folders/predelete")
    @ApiDoc("Pre-delete folders")
    @ResourceFilter(ManageBoardRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @SuppressWarnings("unchecked")
    public void preDeleteFolders(HttpServerRequest request) {
        RequestUtils.bodyToJson(request, pathPrefix + "deleteFolder", folders ->
                UserUtils.getUserInfos(eb, request, user -> {
                    List<String> folderIds = folders.getJsonArray(Field.FOLDERIDS).getList();
                        folderService.preDeleteFoldersAndBoards(user, folderIds, false)
                                .onFailure(err -> renderError(request))
                                .onSuccess(result -> renderJson(request, result));
                }));
    }

    @Put("/folders/restore")
    @ApiDoc("Restore pre-deleted folders")
    @ResourceFilter(ManageBoardRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @SuppressWarnings("unchecked")
    public void restoreFolders(HttpServerRequest request) {
        RequestUtils.bodyToJson(request, pathPrefix + "deleteFolder", folders ->
                UserUtils.getUserInfos(eb, request, user -> {
                    List<String> folderIds = folders.getJsonArray(Field.FOLDERIDS).getList();
                    folderService.preDeleteFoldersAndBoards(user, folderIds, true)
                            .onFailure(err -> renderError(request))
                            .onSuccess(result -> renderJson(request, result));
                }));
    }

}
