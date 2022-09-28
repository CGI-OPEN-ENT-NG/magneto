package fr.cgi.magneto.service;

import fr.cgi.magneto.model.*;
import io.vertx.core.*;
import io.vertx.core.json.*;
import org.entcore.common.user.*;

import java.util.*;

public interface FolderService {

        /**
        * Get user folders
        * @param user          User Object containing user id and displayed name
        * @param isDeleted     fetch deleted folders if true
        * @return              Future {@link Future <JsonObject>} containing list of folders
        */
        Future<JsonArray> getFolders(UserInfos user, boolean isDeleted);

        /**
        * Create a folder
        * @param folder        Folder to create
        * @return              Future {@link Future <JsonObject>} containing newly created folder
        */
        Future<JsonObject> createFolder(FolderPayload folder);

        /**
         * Update a folder
         * @param user       User Object containing user id and displayed name
         * @param folder     Folder to update
         * @return           Future {@link Future <JsonObject>} containing updated folder
         */
        Future<JsonObject> updateFolder(UserInfos user, FolderPayload folder);


        /**
         * Delete folders
         * @param user       User Object containing user id and displayed name
         * @param folderIds  Folders identifiers
         * @return           Future {@link Future <JsonObject>} containing deleted folders
         */
        Future<JsonObject> deleteFoldersAndBoards(UserInfos user, List<String> folderIds);


        /**
         * Predelete folders with their boards
         * @param user       User Object containing user id and displayed name
         * @param folderIds  Folders identifiers
         * @param restore    If true : restore from trash
         * @return           Future {@link Future <JsonObject>} containing predeleted folders
         */
        Future<JsonObject> preDeleteFoldersAndBoards(UserInfos user, List<String> folderIds, boolean restore);
}
