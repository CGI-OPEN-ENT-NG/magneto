package fr.cgi.magneto.service;

import io.vertx.core.*;
import io.vertx.core.json.*;
import org.entcore.common.user.*;

public interface FolderService {

        /**
        * Get user folders
        * @param user          User Object containing user id and displayed name
        * @return              Future {@link Future <JsonObject>} containing list of folders
        */
        Future<JsonArray> getFolders(UserInfos user);

        /**
        * Create a folder
        * @param user          User Object containing user id and displayed name
        * @param folder        Folder to create
        * @return              Future {@link Future <JsonObject>} containing newly created folder
        */
        Future<JsonObject> createFolder(UserInfos user, JsonObject folder);
}
