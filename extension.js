/* extension.js
 *
 * Listens to org.gnome.settings-daemon.plugins.color night-light-enabled
 * and shows an OSD when it changes.
 */

import Gio from 'gi://Gio';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

const COLOR_SCHEMA = 'org.gnome.settings-daemon.plugins.color';
const NIGHT_LIGHT_KEY = 'night-light-enabled';

export default class Extension {
    constructor() {
        this._settings = null;
        this._changedId = 0;
    }

    enable() {
        // Get the settings schema for Night Light
        this._settings = new Gio.Settings({ schema_id: COLOR_SCHEMA });

        // Connect to key changes
        this._changedId = this._settings.connect(
            `changed::${NIGHT_LIGHT_KEY}`,
            this._onNightLightChanged.bind(this)
        );

        // Also show current state once on enable (optional)
        this._onNightLightChanged();
    }

    disable() {
        if (this._settings && this._changedId) {
            this._settings.disconnect(this._changedId);
            this._changedId = 0;
        }
        this._settings = null;
    }

    _onNightLightChanged() {
        const enabled = this._settings.get_boolean(NIGHT_LIGHT_KEY);

        // Simple OSD using Shell's built-in notification system
        const title = enabled ? 'Night Light enabled' : 'Night Light disabled';
        const iconName = enabled ? 'night-light-symbolic' : 'night-light-disabled-symbolic';

        Main.osdWindowManager.show(
            -1,                  // monitor, -1 = primary
            Gio.Icon.new_for_string(iconName),
            title,
            null,                   // level (for sliders), unused here
            null                    // max level, unused here
        );
    }
}
