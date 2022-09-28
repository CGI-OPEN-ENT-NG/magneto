package fr.cgi.magneto.service;

import fr.cgi.magneto.model.*;
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
        * @param folder        Folder to create
        * @return              Future {@link Future <JsonObject>} containing newly created folder
        */
        Future<JsonObject> createFolder(FolderPayload folder);
}
