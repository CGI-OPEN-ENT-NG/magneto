package fr.cgi.magneto.model.user;

import fr.cgi.magneto.model.Model;
import io.vertx.core.json.JsonObject;
import org.entcore.common.user.UserInfos;

public class User extends UserInfos implements Model<User> {

    public User(String id, String name) {
        super();
        this.setUserId(id);
        this.setUsername(name);
    }

    public User(JsonObject user) {
        super();
        this.setUserId("");
        this.setUsername("");
    }


    @Override
    public JsonObject toJson() {
        return null;
    }

    @Override
    public User model(JsonObject model) {
        return null;
    }
}
