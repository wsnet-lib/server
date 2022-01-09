/**
 * Manually close the client connection
 */
exports.handler = ({ client }) => {
  if (!client.closed) client.close();
};
